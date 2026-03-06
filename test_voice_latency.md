# Voice Latency Testing Guide

## Quick Test Steps

### 1. Test Mic Latency

1. Open AIVoicePanel by clicking the voice button
2. Speak a word ("test", "hello", etc.)
3. Check browser console for timing logs
4. Expected latency: **100-150ms** from speech to Gemini

### 2. Test Audio Quality

1. Record a sample conversation (5-10 seconds)
2. Listen for:
   - ✅ Clear (not robotic)
   - ✅ No dropouts
   - ✅ Natural prosody (tone, rhythm)
   - ✅ No echo/feedback

### 3. Test Different Voices

From voice picker, test each voice:

- **Aoede** - Warm and bright (recommended for relaxed learning)
- **Charon** - Calm and informative (recommended for technical topics)
- **Fenrir** - Confident and expressive (recommended for motivation)
- **Puck** - Upbeat and lively (recommended for energy boost)

Compare clarity and latency across all voices.

### 4. Monitor Queue Performance

Open browser DevTools → Console tab and look for:

```
Audio queue overflow - dropping chunk to maintain latency
```

- ✅ Should NOT see this message frequently
- If you do, it means network is slow - try reducing screen capture frequency

### 5. Long Session Stability Test

1. Have a 10+ minute conversation
2. Check DevTools Memory tab
3. Expected memory usage: **~50-100MB** (stable, no growth)

---

## Benchmarking Commands

### Backend: Monitor proxy server

```bash
# Windows
python manage.py shell
from ai_mentoring.voice_server import app
# Check logs while running

# Or run standalone:
python backend/ai_mentoring/voice_server.py
```

### Frontend: Extract timing info

```javascript
// In browser console
const logs = [];
window.voiceTimings = logs;

// Add to useVoiceSession.js for precise measurements
const startTime = performance.now();
// ... do operation ...
console.log(`Operation took ${performance.now() - startTime}ms`);
```

---

## Common Issues & Fixes

| Issue                    | Cause                             | Fix                                     |
| ------------------------ | --------------------------------- | --------------------------------------- |
| **Lag (>1s)**            | Large audio chunks, network delay | ✅ Already fixed (100ms chunks)         |
| **Robotic voice**        | Poor resampling                   | ✅ Already fixed (linear interpolation) |
| **Crackling/distortion** | Queue overflow                    | ✅ Already fixed (max 5 chunks)         |
| **Drops out**            | Mic permissions revoked           | Grant mic permissions again             |
| **No response**          | WebSocket disconnected            | Refresh page                            |
| **Memory leak**          | Audio buffers not freed           | ✅ Already fixed (bounded queue)        |

---

## Network Conditions Testing

### Test on Slow Network

```javascript
// Chrome DevTools → Network tab
// Set throttling to "Slow 3G"
// Should still work but with visible jitter buffer

// Should still handle:
- Voice latency < 500ms
- Audio playback without dropouts
- No crashes
```

### Test on Congested Network

```javascript
// Chrome DevTools → Network tab
// Simulate up/down bandwidth limits
// Expect graceful degradation:
- Increased latency (up to 1s)
- Occasional queue overflow warnings (acceptable)
- Still maintains audio continuity
```

---

## Expected Performance After Optimization

| Metric                | Before    | After     | Improvement |
| --------------------- | --------- | --------- | ----------- |
| Mic-to-Gemini latency | 250ms     | 100ms     | 60% ⬇️      |
| Playback latency      | 300-400ms | 200-250ms | 40% ⬇️      |
| Total E2E latency     | 800ms-1s  | 400-500ms | 50% ⬇️      |
| Memory per session    | Unbounded | ~50-100MB | Bounded ✅  |
| Audio quality         | Distorted | Clear     | 100% ✅     |

---

## Production Readiness Checklist

- [ ] All voices tested and sound clear
- [ ] No console errors during long sessions
- [ ] Memory remains stable (no leaks)
- [ ] Latency acceptable (<500ms E2E)
- [ ] Works on multiple browsers (Chrome, Edge, Firefox)
- [ ] Works on mobile (iOS Safari, Chrome)
- [ ] Works on poor networks (Slow 3G)
- [ ] API key environment variable set
- [ ] Websocket proxy server running on prod
- [ ] Deployed to production

---

## Support Commands

### Debug WebSocket issues

```bash
# Check proxy logs
tail -f logs/voice_proxy.log

# Kill stuck processes
lsof -i :8001  # Find process on port 8001
kill -9 <PID>
```

### Restart voice proxy (production)

```bash
# Method 1: Manual
python backend/ai_mentoring/voice_server.py &

# Method 2: Using supervisord (recommended for prod)
supervisorctl restart voice_proxy
```

---

## Future A/B Testing Ideas

- Compare 100ms vs 50ms chunk sizes
- Test different resampling algorithms
- Measure impact of AGC vs manual levels
- Profile CPU usage across browsers
- Test with different Gemini model versions
