# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Add Your ElevenLabs API Key

Open `.env.local` and replace with your actual keys:

```env
ELEVENLABS_API_KEY=your_actual_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here
```

To get your API key:
- Go to [ElevenLabs](https://elevenlabs.io/)
- Sign up or log in
- Navigate to Profile → API Keys
- Copy your API key

### 2. Start the Development Server

The server is already running at:
```
http://localhost:3000
```

If you need to restart:
```bash
npm run dev
```

### 3. Test the Application

1. **Open** http://localhost:3000 in your browser
2. **Wait** for the 3D character to load (166 MB model)
3. **Check** the connection indicator in the header (should be green)
4. **Watch** for new tokens to appear in the left column
5. **Listen** for voice announcements when new tokens arrive

## 🎯 What You'll See

### Header (Top)
- "ALON TERMINAL" logo
- Connection status (green = connected)
- Voice toggle button
- Connect Wallet button
- Settings button

### Left Column (30%)
- Search bar
- New tokens list
- Each token shows:
  - Image
  - Name and symbol
  - Age (updates every second)
  - Social media links
  - Stats (replies, retweets, likes)
  - Volume and Market Cap
  - Price
  - Percentage change

### Center Column (40%)
- 3D character (alon.glb)
- Loading indicator while model loads
- Camera controls (orbit, zoom)
- Character will announce new tokens

### Right Column (30%)
- Migrated tokens (Market Cap > 69K SOL)
- Same layout as left column

### Footer (Bottom)
- Navigation links
- Portfolio value
- 24h change

## 🔍 Debugging

### Check Browser Console

Open Developer Tools (F12) and look for:

```
✅ [PumpPortal] Connected to WebSocket
✅ [ModelLoader] Model loaded successfully
✅ [ModelLoader] Found morph targets: [...]
✅ [Character3D] Available morph targets: [...]
✅ [VoiceAnnouncement] Generating: New token: ...
```

### Common Issues

**No tokens appearing?**
- Check WebSocket connection status in header
- Check console for "[PumpPortal] Connected" message
- PumpPortal may have rate limits or downtime

**3D character not loading?**
- Model is 166 MB, takes time to download
- Check console for errors
- Verify `public/models/alon.glb` exists

**No voice announcements?**
- Voice is rate-limited to 1 per 5 seconds
- Check `.env.local` has valid API key
- Check console for ElevenLabs errors
- Toggle voice on/off in header

**Mouth not moving?**
- This is expected! Needs morph target mapping
- See IMPLEMENTATION_STATUS.md for details
- Check console for available morph targets
- Update `lipSyncController.ts` with actual names

## 🎨 Customization

### Change Colors

Edit `app/globals.css`:

```css
@theme {
  --color-background: #0d0d0d;
  --color-card: #1a1a1a;
  --color-green: #00ff00;
  --color-red: #ff4444;
  --color-text: #ffffff;
  --color-text-secondary: #888888;
  --color-border: #333333;
}
```

### Adjust Announcement Rate

Edit `.env.local`:

```env
NEXT_PUBLIC_ANNOUNCEMENT_INTERVAL=5000  # milliseconds
```

### Change Token Limit

Edit `.env.local`:

```env
NEXT_PUBLIC_MAX_TOKENS=100  # keep last N tokens
```

## 📱 Usage Tips

1. **Search Tokens**: Type in the search bar to filter by name, symbol, or address
2. **Voice Control**: Click the speaker icon in header to enable/disable announcements
3. **3D Controls**:
   - Left click + drag to rotate camera
   - Scroll to zoom in/out
   - The character stays centered

## 🐛 Known Issues

1. **Lip Sync**: Mouth doesn't move yet (needs morph target mapping)
2. **Large Model**: 166 MB download on first load
3. **Rate Limiting**: Voice limited to 1 per 5 seconds
4. **WebSocket**: May disconnect and reconnect periodically

## 📚 More Information

- **Full Documentation**: See README.md
- **Implementation Details**: See IMPLEMENTATION_STATUS.md
- **Code Structure**: Explore the codebase
- **Tech Stack**: Next.js 16, TypeScript, Three.js, Tailwind CSS v4

## 🎉 Enjoy!

You now have a fully functional ALON TERMINAL with real-time token monitoring and voice announcements!
