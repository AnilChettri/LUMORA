# AI Features Setup Guide

## Overview

The Brainimation UI now includes two powerful AI features:

1. **Camera-Based Mood Detection** - Uses TensorFlow.js to analyze facial expressions
2. **Voice Agent (Lumi)** - Powered by OpenAI's GPT to provide emotional support

---

## 🎥 Camera Mood Detection Setup

### What It Does

The camera detection feature:
- Captures your face using the device camera
- Analyzes facial expressions using TensorFlow.js
- Detects moods: happy, sad, anxious, tired, stressed, neutral
- Shows confidence level (70-99%)
- Never stores images (privacy-first)

### Installation

Install the required ML packages:

```bash
npm install @tensorflow/tfjs-core \
            @tensorflow/tfjs-converter \
            @tensorflow/tfjs-backend-webgl \
            @tensorflow-models/blazeface
```

### Configuration

The camera detection works out of the box. No API keys required!

**File**: `client/src/lib/emotionDetection.ts`

Key functions:
- `initializeEmotionModel()` - Load the TensorFlow model
- `detectEmotionFromFrame(videoElement)` - Analyze a video frame
- `disposeEmotionModel()` - Clean up resources

### Usage Example

```typescript
import { 
  detectEmotionFromFrame, 
  disposeEmotionModel 
} from "@/lib/emotionDetection";

// Detect emotion from video element
const { mood, confidence } = await detectEmotionFromFrame(videoRef.current);
console.log(`Detected mood: ${mood} (${confidence}% confidence)`);

// Clean up when done
disposeEmotionModel();
```

### Supported Devices

✅ Desktop with webcam  
✅ Laptops with built-in camera  
✅ Mobile with front camera  
⚠️ Requires HTTPS in production (camera API requirement)

### Privacy

- **No data sent to servers** - All processing happens locally
- **No images stored** - Video is processed and discarded
- **User consent required** - App asks for camera permission
- **Can be disabled** - Users can select mood manually

### Performance

- Model initialization: ~2-5 seconds (first load)
- Frame analysis: ~50-200ms per frame
- Bundle size: ~3-5MB (one-time download)

---

## 🗣️ Voice Agent (Lumi) Setup

### What It Does

Lumi is your AI mental health companion:
- Understands your emotional state
- Provides supportive responses
- Suggests coping strategies
- Can detect crisis situations
- Maintains conversation history for context
- Supports both text and voice input

### Installation

1. **Install OpenAI package** (already included):
```bash
npm install openai
```

2. **Get OpenAI API Key**:
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Save it securely

3. **Configure Environment**:

**Development** (`.env.local`):
```env
OPENAI_API_KEY=sk-your-key-here
```

**Production** (`.env.production` or environment variable):
```env
OPENAI_API_KEY=${OPENAI_API_KEY}
```

### Backend Configuration

**File**: `server/openaiIntegration.ts`

Functions:
- `chatWithLumi(message, context)` - Chat with OpenAI
- `detectSentiment(message)` - Analyze user emotion
- `getCrisisResources()` - Get help resources
- `getFallbackResponse(message)` - Simple response without OpenAI

### Fallback Behavior

If OpenAI is not configured or unavailable:
- ✅ App still works with rule-based responses
- ✅ Uses keyword matching for suggestions
- ✅ Provides helpful activities and resources
- ✅ Encourages user to try breathing exercises or journal

### Usage in Frontend

**File**: `client/src/pages/VoiceAgent.tsx`

The component includes:
- Speech recognition (Web Speech API)
- Text input option
- Suggested prompts
- Chat history
- Text-to-speech output (optional)
- Typing indicators

### Crisis Detection

Lumi automatically detects concerning keywords:
- Self-harm mentions
- Suicide references
- Hopelessness/worthlessness expressions
- Other crisis indicators

When detected:
- ✅ Provides crisis resources (988 Lifeline, Crisis Text Line)
- ✅ Shows empathy and support
- ✅ Encourages reaching out to professionals
- ✅ Never denies help

**Important**: Lumi is a companion, not a replacement for professional mental health care.

### Voice Input Setup

Voice recognition uses Web Speech API (built-in):

**Browser Support**:
- ✅ Chrome/Edge (best support)
- ✅ Safari 14.1+
- ✅ Firefox (limited)
- ❌ Mobile Safari (limited)

**Fallback**: Text input available for all browsers

### Text-to-Speech (Optional)

TTS uses Web Speech API (built-in):

```typescript
// In VoiceAgent.tsx, uncomment to enable:
// speechSynthesis.speak(utterance);
```

**Note**: Most browsers require user interaction to start speech.

### API Endpoint

**POST** `/api/voice-agent`

Request:
```json
{
  "message": "I'm feeling anxious"
}
```

Response:
```json
{
  "response": "I understand you're feeling anxious...",
  "sentiment": "concerning" | "neutral" | "positive"
}
```

---

## 🔧 Complete Setup Checklist

### For Camera Detection
- [ ] Run `npm install` to get TensorFlow packages
- [ ] Test camera access in browser
- [ ] Allow camera permissions when prompted
- [ ] Try mood detection on MoodDetection page
- [ ] Verify confidence scores appear
- [ ] Test with different expressions

### For Voice Agent
- [ ] Get OpenAI API key from https://platform.openai.com/api-keys
- [ ] Add `OPENAI_API_KEY` to `.env.local` (development)
- [ ] Run `npm run dev` to start server
- [ ] Navigate to Voice Agent page
- [ ] Try suggested prompts
- [ ] Test voice input (if supported)
- [ ] Test text input
- [ ] Verify responses are personalized
- [ ] Check crisis detection works

### Testing Both Features
- [ ] Test mood detection → recommended activities
- [ ] Test voice agent → mood-specific suggestions
- [ ] Enable both in same session
- [ ] Test on mobile device
- [ ] Test with poor internet (should still work)
- [ ] Monitor browser console for errors

---

## 📊 Monitoring & Troubleshooting

### Camera Not Working

**Error**: "Camera access denied"
- ✅ Check browser permissions
- ✅ Verify HTTPS in production
- ✅ Try different browser
- ✅ Clear browser cache

**Error**: "Model failed to load"
- ✅ Check internet connection
- ✅ Verify TensorFlow packages installed
- ✅ Look at browser console for details
- ✅ Try refreshing page

**No mood detected**
- ✅ Ensure good lighting
- ✅ Position face clearly in camera
- ✅ Check browser console for errors

### Voice Agent Not Responding

**Error**: "OpenAI API error"
- ✅ Verify API key is valid
- ✅ Check API key has credits
- ✅ Ensure environment variable is set
- ✅ Check server logs for errors

**Getting fallback responses**
- ✅ This is normal if OpenAI is not configured
- ✅ Check OPENAI_API_KEY environment variable
- ✅ Verify API key in `.env.local`
- ✅ Restart server after changing `.env`

**Voice input not working**
- ✅ Check browser supports Web Speech API
- ✅ Verify microphone permissions
- ✅ Try text input instead
- ✅ Check browser console for errors

---

## 🚀 Performance Optimization

### Camera Detection

```typescript
// Good: Clean up resources when done
useEffect(() => {
  return () => disposeEmotionModel();
}, []);

// Reuse model instead of reloading
const model = await initializeEmotionModel();
```

### Voice Agent

```typescript
// Keep conversation history but limit to last 10 messages
const context = {
  messages: messages.slice(-10),
};

// Use shorter max_tokens for faster responses
max_tokens: 150
```

---

## 📈 Usage Analytics

Monitor these metrics:

### Camera Detection
- Accuracy of mood detection
- Confidence scores
- Detection speed
- User preferences (camera vs manual)

### Voice Agent
- Number of conversations
- Average conversation length
- User satisfaction
- Crisis detection accuracy
- Response quality

---

## 🔐 Security & Privacy

### Camera Detection
- ✅ No image transmission
- ✅ Client-side only processing
- ✅ User consent required
- ✅ Can disable anytime

### Voice Agent
- ✅ Messages stored encrypted
- ✅ HTTPS required in production
- ✅ Conversation limited to last 10 messages (context window)
- ✅ User can delete conversation history
- ✅ OpenAI API calls are secure

### API Keys
- ❌ Never commit API keys
- ❌ Never expose in frontend code
- ✅ Use environment variables
- ✅ Rotate keys regularly
- ✅ Use API key restrictions

---

## 📚 Additional Resources

### TensorFlow.js Documentation
- https://js.tensorflow.org/
- https://github.com/tensorflow/tfjs-models

### OpenAI API Documentation
- https://platform.openai.com/docs/
- https://platform.openai.com/examples/

### Web APIs
- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- Camera/MediaDevices: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices

### Crisis Resources
- National Suicide Prevention Lifeline: 988 (US)
- Crisis Text Line: Text HOME to 741741
- International: https://www.iasp.info/resources/Crisis_Centres/

---

## 💡 Tips & Best Practices

### For Users
1. Find good lighting for camera detection
2. Position face clearly in camera frame
3. Be honest with Lumi about your feelings
4. Use suggested activities after mood check
5. Journal about your thoughts
6. Share in community when comfortable

### For Developers
1. Always show fallback UI if features unavailable
2. Handle network errors gracefully
3. Respect user privacy (no tracking)
4. Test on actual devices
5. Monitor API usage and costs
6. Keep conversation history limited
7. Implement proper error logging

---

## Support

For issues or questions:
- Check browser console for errors
- Review this guide carefully
- See main README.md
- Check documentation files
- Open GitHub issue with details

---

**Last Updated**: December 3, 2025  
**Status**: Production Ready  
**Version**: 1.0.0
