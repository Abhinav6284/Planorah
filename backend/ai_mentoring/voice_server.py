"""
Standalone WebSocket proxy server for Gemini Live API.

Runs alongside Django on a separate port (default 8001).
Keeps the GEMINI_API_KEY server-side — the frontend never sees it.

Protocol:
  1. Client connects to ws://localhost:8001/ws/voice
  2. Client sends a JSON setup message with system instructions & config
  3. Client streams audio chunks (base64 PCM16 @ 16kHz) and optional screenshots
  4. Server proxies everything to Gemini Live API and relays responses back
  5. Client receives audio chunks (base64 PCM16 @ 24kHz) and text transcripts
"""

import asyncio
import json
import logging
import os
import signal
import sys
from pathlib import Path

# Load Django .env so we can read GEMINI_API_KEY
ENV_PATH = Path(__file__).resolve().parent.parent / '.env'
if ENV_PATH.exists():
    from dotenv import load_dotenv
    load_dotenv(ENV_PATH)

try:
    import websockets
except ImportError:
    print("ERROR: 'websockets' package is required. Install it with: pip install websockets")
    sys.exit(1)

logger = logging.getLogger('voice_proxy')
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s [%(levelname)s] %(message)s')

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GEMINI_WS_URL = (
    'wss://generativelanguage.googleapis.com/ws/'
    'google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent'
    f'?key={GEMINI_API_KEY}'
)

VOICE_SYSTEM_PROMPT = """You are a warm, empathetic AI mentor embedded in a learning platform called Planora.
You are talking to a student in real-time via voice.

Your role is to:
- Listen carefully and respond conversationally
- Give clear, actionable guidance on their studies, projects, and career goals
- Be encouraging and supportive while being honest
- If you can see their screen, reference what you see to give contextual help
- Keep responses concise (2-4 sentences for quick exchanges, longer if they ask for detail)
- Use natural speech patterns — contractions, warm tone, occasional encouragement
- If they share code or their screen, analyze what you see and give specific feedback

Remember: You are speaking out loud, not writing. Keep it conversational."""

DEFAULT_VOICE = 'Aoede'  # Gemini built-in voice

PROXY_HOST = os.getenv('VOICE_PROXY_HOST', 'localhost')
PROXY_PORT = int(os.getenv('VOICE_PROXY_PORT', '8001'))


async def proxy_handler(client_ws):
    """Handle one client WebSocket connection."""
    client_addr = client_ws.remote_address
    logger.info(f"Client connected: {client_addr}")

    if not GEMINI_API_KEY:
        await client_ws.send(json.dumps({
            'type': 'error',
            'message': 'GEMINI_API_KEY is not configured on the server.',
        }))
        await client_ws.close()
        return

    gemini_ws = None

    try:
        # Wait for the client setup message
        raw_setup = await asyncio.wait_for(client_ws.recv(), timeout=10)
        setup_data = json.loads(raw_setup)

        # Build Gemini setup message
        voice_name = setup_data.get('voiceName', DEFAULT_VOICE)
        context_source = setup_data.get('contextSource', 'general')
        student_goal = setup_data.get('studentGoal', '')

        system_text = VOICE_SYSTEM_PROMPT
        if context_source:
            system_text += f"\n\nThe student is currently in the '{context_source}' section of the platform."
        if student_goal:
            system_text += f"\nTheir current goal: {student_goal}"

        # Include session memory if provided
        memory = setup_data.get('sessionMemory', [])
        if memory:
            system_text += "\n\n[Previous session memory]"
            for i, m in enumerate(memory, 1):
                system_text += f"\nSession {i}: {m.get('session_summary', 'N/A')}"
            system_text += "\n[End of memory]"

        gemini_setup = {
            'setup': {
                'model': 'models/gemini-2.5-flash-native-audio-preview-12-2025',
                'generationConfig': {
                    'responseModalities': ['AUDIO'],
                    'speechConfig': {
                        'voiceConfig': {
                            'prebuiltVoiceConfig': {
                                'voiceName': voice_name,
                            }
                        }
                    }
                },
                'systemInstruction': {
                    'parts': [{'text': system_text}]
                },
            }
        }

        # Connect to Gemini
        logger.info(f"Connecting to Gemini Live API for {client_addr}...")
        gemini_ws = await websockets.connect(
            GEMINI_WS_URL,
            additional_headers={'Content-Type': 'application/json'},
            max_size=16 * 1024 * 1024,  # 16 MB
            ping_interval=30,
            ping_timeout=10,
        )

        # Send setup
        await gemini_ws.send(json.dumps(gemini_setup))

        # Wait for setup completion from Gemini
        setup_response = await asyncio.wait_for(gemini_ws.recv(), timeout=10)
        setup_resp_data = json.loads(setup_response)

        if 'setupComplete' in setup_resp_data:
            logger.info(f"Gemini session established for {client_addr}")
            await client_ws.send(json.dumps({'type': 'ready'}))
        else:
            logger.warning(f"Unexpected setup response: {setup_resp_data}")
            await client_ws.send(json.dumps({
                'type': 'error',
                'message': 'Failed to establish Gemini session.',
            }))
            return

        # Bidirectional relay
        async def client_to_gemini():
            """Forward messages from the browser to Gemini."""
            try:
                async for message in client_ws:
                    data = json.loads(message)
                    msg_type = data.get('type', '')

                    if msg_type == 'audio':
                        # Forward audio chunk via realtimeInput
                        gemini_msg = {
                            'realtimeInput': {
                                'mediaChunks': [{
                                    'mimeType': 'audio/pcm;rate=16000',
                                    'data': data['data'],
                                }]
                            }
                        }
                        await gemini_ws.send(json.dumps(gemini_msg))

                    elif msg_type == 'screenshot':
                        # Forward screen capture as inline image content
                        logger.info(f"Forwarding screenshot for {client_addr} "
                                    f"({len(data.get('data', ''))//1024}KB base64)")
                        try:
                            # Use realtimeInput for image frames (same as audio)
                            gemini_msg = {
                                'realtimeInput': {
                                    'mediaChunks': [{
                                        'mimeType': data.get('mimeType', 'image/jpeg'),
                                        'data': data['data'],
                                    }]
                                }
                            }
                            await gemini_ws.send(json.dumps(gemini_msg))
                        except Exception as img_err:
                            logger.warning(f"realtimeInput image failed: {img_err}, "
                                           f"trying clientContent fallback")
                            # Fallback: send as clientContent with inline data
                            try:
                                gemini_msg = {
                                    'clientContent': {
                                        'turns': [{
                                            'role': 'user',
                                            'parts': [{
                                                'inlineData': {
                                                    'mimeType': data.get('mimeType', 'image/jpeg'),
                                                    'data': data['data'],
                                                }
                                            }, {
                                                'text': 'Here is my current screen. '
                                                        'Please acknowledge what you see briefly.'
                                            }]
                                        }],
                                        'turnComplete': True,
                                    }
                                }
                                await gemini_ws.send(json.dumps(gemini_msg))
                            except Exception as fallback_err:
                                logger.error(f"clientContent image fallback also failed: "
                                             f"{fallback_err}")

                    elif msg_type == 'end':
                        logger.info(f"Client {client_addr} ended session")
                        break

            except websockets.exceptions.ConnectionClosed:
                logger.info(f"Client {client_addr} disconnected")

        async def gemini_to_client():
            """Forward messages from Gemini to the browser."""
            try:
                async for message in gemini_ws:
                    data = json.loads(message)

                    # Check for Gemini-side errors
                    if 'error' in data:
                        error_info = data['error']
                        logger.error(
                            f"Gemini error for {client_addr}: {error_info}")
                        await client_ws.send(json.dumps({
                            'type': 'error',
                            'message': f"AI service error: {error_info.get('message', str(error_info))}",
                        }))
                        continue

                    # Extract audio response
                    server_content = data.get('serverContent', {})
                    model_turn = server_content.get('modelTurn', {})
                    parts = model_turn.get('parts', [])

                    for part in parts:
                        inline = part.get('inlineData', {})
                        if inline.get('mimeType', '').startswith('audio/'):
                            await client_ws.send(json.dumps({
                                'type': 'audio',
                                'data': inline['data'],
                                'mimeType': inline['mimeType'],
                            }))
                        elif 'text' in part:
                            await client_ws.send(json.dumps({
                                'type': 'transcript',
                                'text': part['text'],
                            }))

                    # Check if turn is complete
                    if server_content.get('turnComplete'):
                        await client_ws.send(json.dumps({
                            'type': 'turnComplete',
                        }))

            except websockets.exceptions.ConnectionClosed:
                logger.info(f"Gemini connection closed for {client_addr}")

        # Run both relay directions concurrently
        await asyncio.gather(
            client_to_gemini(),
            gemini_to_client(),
        )

    except asyncio.TimeoutError:
        logger.error(f"Timeout during setup for {client_addr}")
        await client_ws.send(json.dumps({
            'type': 'error',
            'message': 'Connection timed out.',
        }))
    except Exception as e:
        logger.error(f"Error for {client_addr}: {e}")
        try:
            await client_ws.send(json.dumps({
                'type': 'error',
                'message': str(e),
            }))
        except Exception:
            pass
    finally:
        if gemini_ws:
            try:
                await gemini_ws.close()
            except Exception:
                pass
        logger.info(f"Session ended for {client_addr}")


async def main():
    """Start the WebSocket proxy server."""
    logger.info(f"Starting voice proxy on ws://{PROXY_HOST}:{PROXY_PORT}")

    stop = asyncio.get_event_loop().create_future()

    # Graceful shutdown on SIGINT/SIGTERM
    if sys.platform != 'win32':
        for sig in (signal.SIGINT, signal.SIGTERM):
            asyncio.get_event_loop().add_signal_handler(sig, stop.set_result, None)

    async with websockets.serve(
        proxy_handler,
        PROXY_HOST,
        PROXY_PORT,
        max_size=16 * 1024 * 1024,
    ) as server:
        logger.info(f"Voice proxy ready at ws://{PROXY_HOST}:{PROXY_PORT}")

        if sys.platform == 'win32':
            # On Windows, just run forever (Ctrl+C to stop)
            await asyncio.Future()
        else:
            await stop

    logger.info("Voice proxy stopped.")


if __name__ == '__main__':
    asyncio.run(main())
