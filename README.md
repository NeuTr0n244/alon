# ALON TERMINAL

Real-time crypto intelligence terminal. Live market data, news, and AI-powered insights with a 3D character that announces new tokens using voice and lip sync.

## Features

- **Real-time WebSocket Connection**: Connects to PumpPortal to receive live token data
- **3-Column Layout**:
  - Left: New tokens with search functionality
  - Center: 3D character with voice announcements
  - Right: Migrated tokens (Market Cap > 69K SOL)
- **3D Character**: Renders `alon.glb` model with Three.js
- **Voice Announcements**: ElevenLabs text-to-speech for new token announcements
- **Lip Sync**: Character mouth movements synchronized with voice (basic implementation)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Edit `.env.local` and add your ElevenLabs API key:

```env
ELEVENLABS_API_KEY=your_actual_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deploy Automático

Este projeto está configurado com deploy automático no Vercel via GitHub Actions.

### Comandos Rápidos:

```bash
# Commit e push automático
npm run commit "Sua mensagem"

# Build + Commit + Push + Deploy
npm run ship "Deploy: Nova versão"

# Deploy manual no Vercel
npm run deploy
```

📚 **Guia completo:** Veja [DEPLOY.md](./DEPLOY.md) para instruções detalhadas de configuração.

## Project Structure

```
├── app/
│   ├── api/elevenlabs/       # ElevenLabs API proxy
│   ├── globals.css            # Global styles with Tailwind
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main page
├── components/
│   ├── character/             # 3D character components
│   ├── columns/               # Token list columns
│   ├── layout/                # Header, Footer, MainLayout
│   ├── providers/             # WebSocket provider
│   └── ui/                    # Reusable UI components
├── hooks/                     # Custom React hooks
├── lib/
│   ├── elevenlabs/            # ElevenLabs client
│   ├── three/                 # Three.js utilities
│   ├── utils/                 # Formatters and helpers
│   └── websocket/             # PumpPortal WebSocket client
├── public/models/             # 3D model (alon.glb)
├── store/                     # Zustand state management
└── types/                     # TypeScript type definitions
```

## Tech Stack

- **Next.js 16** - React framework with Turbopack
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Three.js + React Three Fiber** - 3D rendering
- **Zustand** - State management
- **ElevenLabs** - Text-to-speech
- **PumpPortal WebSocket** - Real-time token data

## Color Scheme

- Background: `#0d0d0d`
- Cards: `#1a1a1a`
- Green (accent): `#00ff00`
- Red (negative): `#ff4444`
- Text: `#ffffff`
- Secondary text: `#888888`
- Borders: `#333333`

## Key Components

### WebSocket Connection
- Auto-connects to PumpPortal on app load
- Subscribes to new tokens and trades
- Auto-reconnects with exponential backoff
- Keeps last 100 tokens in memory

### Token Display
- Shows token image, name, symbol, creator
- Age updates every second (0s, 1s, 2s...)
- Social media icons (Twitter, Telegram, Website)
- Stats: Volume, Market Cap, Price
- Percentage change indicator

### 3D Character
- Loads 166 MB GLB model
- Supports morph target animations
- Camera controls (orbit, zoom)
- Loading state with fallback

### Voice Announcements
- Rate limited to 1 per 5 seconds
- Queues tokens if arriving faster
- Format: "New token: [Name], symbol [Symbol]. Market cap: [MC]"
- Lip sync controller maps visemes to blend shapes

## Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run lint
```

## Performance Notes

- The GLB model is 166 MB and may take time to load
- WebSocket keeps only last 100 tokens to manage memory
- Announcements are rate-limited to prevent audio overlap
- Target 60 FPS for 3D rendering

## Next Steps

To fully implement lip sync with viseme data:

1. Update ElevenLabs API call to request viseme timestamps
2. Parse viseme data from response
3. Pass visemes to `lipSyncController.playVisemeSequence()`
4. Map visemes to your model's specific morph target names

Current implementation uses basic audio playback without full lip sync integration.

## License

MIT
