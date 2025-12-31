import json
import subprocess
import sys
import os
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class TerminalConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real terminal sessions.
    Spawns a shell process and streams I/O between browser and shell.
    """
    
    async def connect(self):
        """Accept WebSocket connection and spawn shell process."""
        # Get user from scope (JWT auth should be handled in middleware)
        self.user = self.scope.get("user")
        
        # For now, allow connection (add proper auth check later)
        await self.accept()
        
        # Determine shell based on OS
        if sys.platform == 'win32':
            shell = 'cmd.exe'
            self.shell_args = [shell]
        else:
            shell = '/bin/bash'
            self.shell_args = [shell, '-i']  # Interactive mode
        
        # Set working directory
        self.cwd = os.path.expanduser('~')
        
        # Send welcome message
        await self.send(text_data=json.dumps({
            'type': 'output',
            'data': f'\r\n\x1b[1;36m╔══════════════════════════════════════════════════════════╗\x1b[0m\r\n'
                    f'\x1b[1;36m║\x1b[0m  \x1b[1;35m🚀 Planorah CodeSpace Terminal\x1b[0m                          \x1b[1;36m║\x1b[0m\r\n'
                    f'\x1b[1;36m║\x1b[0m  Connected to real shell                                   \x1b[1;36m║\x1b[0m\r\n'
                    f'\x1b[1;36m╚══════════════════════════════════════════════════════════╝\x1b[0m\r\n\r\n'
        }))
        
        # Start shell process
        await self.start_shell()
    
    async def start_shell(self):
        """Start the shell subprocess."""
        try:
            # Create subprocess with pipes
            self.process = await asyncio.create_subprocess_exec(
                *self.shell_args,
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=self.cwd,
                env={**os.environ, 'TERM': 'xterm-256color'}
            )
            
            # Start reading stdout/stderr
            asyncio.create_task(self.read_output(self.process.stdout, 'stdout'))
            asyncio.create_task(self.read_output(self.process.stderr, 'stderr'))
            
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'data': f'Failed to start shell: {str(e)}\r\n'
            }))
    
    async def read_output(self, stream, stream_type):
        """Read output from shell and send to WebSocket."""
        try:
            while True:
                data = await stream.read(1024)
                if not data:
                    break
                
                # Decode and send to client
                text = data.decode('utf-8', errors='replace')
                await self.send(text_data=json.dumps({
                    'type': 'output',
                    'data': text
                }))
        except Exception as e:
            pass  # Stream closed
    
    async def disconnect(self, close_code):
        """Clean up when WebSocket disconnects."""
        if hasattr(self, 'process') and self.process:
            try:
                self.process.terminate()
                await asyncio.wait_for(self.process.wait(), timeout=2.0)
            except:
                self.process.kill()
    
    async def receive(self, text_data):
        """Receive input from WebSocket and write to shell stdin."""
        try:
            data = json.loads(text_data)
            
            if data.get('type') == 'input':
                input_data = data.get('data', '')
                
                if hasattr(self, 'process') and self.process.stdin:
                    self.process.stdin.write(input_data.encode('utf-8'))
                    await self.process.stdin.drain()
            
            elif data.get('type') == 'resize':
                # Handle terminal resize (for future PTY support)
                cols = data.get('cols', 80)
                rows = data.get('rows', 24)
                # PTY resize would go here
                
        except json.JSONDecodeError:
            pass
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'data': f'Error: {str(e)}\r\n'
            }))
