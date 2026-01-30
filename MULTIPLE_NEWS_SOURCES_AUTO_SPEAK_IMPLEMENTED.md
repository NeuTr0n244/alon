# ✅ MÚLTIPLAS FONTES DE NOTÍCIAS + AUTO-FALAR TUDO

## RESUMO:

Implementadas múltiplas fontes de notícias e sistema de auto-fala completo:

1. ✅ **5 novas fontes de notícias** - BBC, Wired, 4chan, Decrypt, The Block
2. ✅ **Auto-falar TODAS as notícias novas** - Com delay de 8 segundos
3. ✅ **Toggle de voz ON/OFF** - Controle manual no header
4. ✅ **Ícones personalizados por fonte** - Visual único para cada fonte
5. ✅ **Total de 10 fontes ativas** - Cobertura completa de crypto e tech

---

## 1. NOVAS FONTES IMPLEMENTADAS

### A. BBC Tech News
**URL**: `https://feeds.bbci.co.uk/news/technology/rss.xml`
**Ícone**: 📺
**Tipo**: General Tech News
**Limite**: 3 notícias

```typescript
async function fetchBBCNews(): Promise<FeedItem[]> {
  const res = await fetch(
    'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/technology/rss.xml'
  );
  // Retorna 3 notícias mais recentes
}
```

### B. Wired
**URL**: `https://www.wired.com/feed/rss`
**Ícone**: ⚡
**Tipo**: Tech & Culture
**Limite**: 3 notícias

```typescript
async function fetchWiredNews(): Promise<FeedItem[]> {
  const res = await fetch(
    'https://api.rss2json.com/v1/api.json?rss_url=https://www.wired.com/feed/rss'
  );
  // Retorna 3 notícias mais recentes
}
```

### C. 4chan Threads
**Boards**: /biz/, /g/, /fit/, /fa/
**Ícone**: 🍀
**Tipo**: Community Threads
**Limite**: 5 threads (top 2 por board)

```typescript
async function fetch4chanThreads(): Promise<FeedItem[]> {
  const boards = ['biz', 'g', 'fit', 'fa'];

  for (const board of boards) {
    const res = await fetch(`https://a.4cdn.org/${board}/catalog.json`);
    // Filtra threads com > 10 replies
    // Pega top 2 threads por board
  }

  return items.slice(0, 5); // Máximo 5 threads total
}
```

**Filtro**: Apenas threads com mais de 10 replies (engajamento)

### D. Decrypt
**URL**: `https://decrypt.co/feed`
**Ícone**: 🔐
**Tipo**: Crypto News
**Limite**: 3 notícias

```typescript
async function fetchDecryptNews(): Promise<FeedItem[]> {
  const res = await fetch(
    'https://api.rss2json.com/v1/api.json?rss_url=https://decrypt.co/feed'
  );
  // Retorna 3 notícias mais recentes
}
```

### E. The Block
**URL**: `https://www.theblock.co/rss.xml`
**Ícone**: 🧱
**Tipo**: Crypto/Blockchain News
**Limite**: 3 notícias

```typescript
async function fetchTheBlockNews(): Promise<FeedItem[]> {
  const res = await fetch(
    'https://api.rss2json.com/v1/api.json?rss_url=https://www.theblock.co/rss.xml'
  );
  // Retorna 3 notícias mais recentes
}
```

---

## 2. TODAS AS 10 FONTES ATIVAS

| # | Fonte | Tipo | Ícone | Limite |
|---|-------|------|-------|--------|
| 1 | **CoinGecko** | Market Data | 🦎 | 3 (SOL, BTC, ETH) |
| 2 | **Alternative.me** | Fear & Greed | 🔮 | 1 |
| 3 | **DexScreener** | Trending/Moonshots | 📊🚀 | 3 + 3 |
| 4 | **CoinTelegraph** | Crypto News | 💎 | 5 |
| 5 | **Decrypt** | Crypto News | 🔐 | 3 |
| 6 | **The Block** | Crypto News | 🧱 | 3 |
| 7 | **BBC Tech** | Tech News | 📺 | 3 |
| 8 | **Wired** | Tech/Culture | ⚡ | 3 |
| 9 | **4chan /biz/** | Finance Threads | 🍀 | 2 |
| 10 | **4chan /g/** | Tech Threads | 🍀 | 2 |
| 11 | **4chan /fit/** | Fitness Threads | 🍀 | 2 |
| 12 | **4chan /fa/** | Fashion Threads | 🍀 | 2 |

**Total aproximado**: 35-40 itens por fetch

---

## 3. SISTEMA AUTO-FALAR

### A. Nova Função autoSpeak:

```typescript
const autoSpeak = useCallback((item: FeedItem) => {
  if (!autoVoiceEnabled) return; // Respeita toggle
  if (!('speechSynthesis' in window)) return;

  // Cancelar fala anterior
  window.speechSynthesis.cancel();

  // Montar texto baseado no tipo
  let textToSpeak = '';
  switch (item.type) {
    case 'news':
      textToSpeak = `News from ${item.source}: ${item.content}`;
      break;
    case 'market':
      textToSpeak = item.content;
      break;
    case 'prediction':
      textToSpeak = item.content;
      break;
    case 'moonshot':
      textToSpeak = `Attention! ${item.content}`;
      break;
    case 'alert':
      textToSpeak = `Alert: ${item.content}`;
      break;
    default:
      textToSpeak = item.content;
  }

  // Configurar voz masculina (pitch 1.1)
  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  // ... configuração de voz ...

  window.speechSynthesis.speak(utterance);
}, [autoVoiceEnabled]);
```

### B. Falar Todas as Notícias Novas:

```typescript
const checkForNewItems = useCallback((newItems: FeedItem[]) => {
  // ... verificação de novos itens ...

  if (brandNewItems.length > 0) {
    console.log(`📢 ${brandNewItems.length} novas notícias detectadas!`);

    // FALAR TODAS (com delay de 8 segundos entre cada)
    brandNewItems.forEach((item, index) => {
      setTimeout(() => {
        autoSpeak(item);
      }, index * 8000); // 8 segundos
    });
  }
}, [autoSpeak]);
```

### C. Formato da Fala por Tipo:

**News:**
```
"News from BBC: Apple announces new breakthrough in quantum computing"
```

**Market:**
```
"MARKET: Solana trending: SOL $125.45 (+3.2%)"
```

**Prediction:**
```
"Prediction: Market sentiment is bullish | Fear & Greed Index: 65 (Greed)"
```

**Moonshot:**
```
"Attention! MOONSHOT ALERT: PepeCoin (PEPE) just hit $750K market cap! This token is gaining serious momentum."
```

**Alert:**
```
"Alert: TRENDING #1: BONK token is gaining attention on DexScreener"
```

---

## 4. TOGGLE DE VOZ ON/OFF

### A. Estado:

```typescript
const [autoVoiceEnabled, setAutoVoiceEnabled] = useState(true);
```

### B. Botão no Header:

```tsx
<button
  className={`${styles.voiceToggle} ${autoVoiceEnabled ? styles.active : ''}`}
  onClick={() => setAutoVoiceEnabled(!autoVoiceEnabled)}
  title={autoVoiceEnabled ? 'Disable auto-voice' : 'Enable auto-voice'}
>
  {autoVoiceEnabled ? '🔊 Voice ON' : '🔇 Voice OFF'}
</button>
```

### C. CSS do Toggle:

```css
.headerControls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.voiceToggle {
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  transition: all 0.15s;
}

.voiceToggle.active {
  background: rgba(0, 255, 0, 0.1);
  border-color: #00ff00;
  color: #00ff00;
}
```

### D. Estados Visuais:

**Voice ON (ativo):**
- Background: Verde transparente
- Border: Verde (#00ff00)
- Texto: Verde
- Ícone: 🔊

**Voice OFF (inativo):**
- Background: Escuro (#1a1a1a)
- Border: Cinza (#333)
- Texto: Cinza (#666)
- Ícone: 🔇

---

## 5. ÍCONES PERSONALIZADOS

### Função getIcon Atualizada:

```typescript
const getIcon = (type: string, source?: string) => {
  // Por fonte específica
  if (source?.includes('4CHAN')) return '🍀';
  if (source?.includes('BBC')) return '📺';
  if (source?.includes('WIRED')) return '⚡';
  if (source?.includes('DECRYPT')) return '🔐';
  if (source?.includes('BLOCK')) return '🧱';
  if (source?.includes('COINGECKO')) return '🦎';
  if (source?.includes('DEXSCREENER')) return '📊';
  if (source?.includes('COINTELEGRAPH')) return '💎';

  // Por tipo (fallback)
  switch (type) {
    case 'prediction': return '🔮';
    case 'market': return '📈';
    case 'news': return '📰';
    case 'alert': return '🚨';
    case 'moonshot': return '🚀';
    default: return '📌';
  }
};
```

### Tabela de Ícones:

| Fonte | Ícone | Significado |
|-------|-------|-------------|
| 4chan | 🍀 | Lucky clover (4chan culture) |
| BBC | 📺 | Traditional media/TV |
| Wired | ⚡ | Electric/Tech energy |
| Decrypt | 🔐 | Encryption/Security |
| The Block | 🧱 | Blockchain blocks |
| CoinGecko | 🦎 | Brand logo (gecko) |
| DexScreener | 📊 | Charts/Trading |
| CoinTelegraph | 💎 | Premium crypto news |
| Prediction | 🔮 | Crystal ball/Future |
| Market | 📈 | Uptrend chart |
| Moonshot | 🚀 | Rocket to the moon |
| Alert | 🚨 | Urgent notification |

---

## 6. FLUXO COMPLETO

```
┌──────────────────────────────────────────────────────────┐
│ 1. Página carrega                                        │
│    ↓                                                      │
│ 2. fetchAllData() busca 10+ fontes simultaneamente:      │
│    - Crypto: CoinGecko, DexScreener, CoinTelegraph       │
│    - Crypto News: Decrypt, The Block                     │
│    - Tech News: BBC, Wired                               │
│    - Community: 4chan (/biz/, /g/, /fit/, /fa/)          │
│    ↓                                                      │
│ 3. ~35-40 itens coletados e ordenados por timestamp      │
│    ↓                                                      │
│ 4. checkForNewItems() compara com fetch anterior         │
│    ↓                                                      │
│ 5. Se houver NOVOS itens (primeira vez após página load):│
│    - Criar alertas no topo (máx 5)                       │
│    - Marcar posts como NEW                               │
│    - FALAR TODOS os novos itens (um por um)              │
│      → Item 1: fala imediatamente                        │
│      → Item 2: fala após 8 segundos                      │
│      → Item 3: fala após 16 segundos                     │
│      → Item N: fala após (N-1) * 8 segundos              │
│    ↓                                                      │
│ 6. Durante fala:                                         │
│    - Botão "CLICK TO HEAR" fica verde                    │
│    - Indicador "Speaking..." aparece no personagem 3D    │
│    - Boca do personagem mexe (animação GLB)              │
│    - Console mostra: "🎤 Auto-falando: [texto]..."       │
│    ↓                                                      │
│ 7. A cada 30 segundos: repetir processo                  │
│    - Buscar novamente todas as fontes                    │
│    - Comparar com itens anteriores                       │
│    - Falar apenas NOVOS itens (não repetir)              │
│    ↓                                                      │
│ 8. Usuário pode:                                         │
│    - Clicar "🔊 Voice ON" para desabilitar auto-fala     │
│    - Clicar "🔇 Voice OFF" para reabilitar               │
│    - Clicar "✕" nos alertas para dispensar               │
│    - Clicar "CLICK TO HEAR" para ouvir manualmente       │
└──────────────────────────────────────────────────────────┘
```

---

## 7. DELAY ENTRE FALAS

### Por que 8 segundos?

**Cálculo:**
- Notícia média: ~20 palavras
- Taxa de fala (rate 1.0): ~3 palavras/segundo
- Tempo de fala: ~6-7 segundos
- **Buffer de 8 segundos**: Garante que terminou + pequena pausa

### Exemplo com 5 Notícias Novas:

```
00:00 - Inicia fala da notícia 1
00:07 - Termina fala da notícia 1
00:08 - Inicia fala da notícia 2
00:15 - Termina fala da notícia 2
00:16 - Inicia fala da notícia 3
00:23 - Termina fala da notícia 3
00:24 - Inicia fala da notícia 4
00:31 - Termina fala da notícia 4
00:32 - Inicia fala da notícia 5
00:39 - Termina fala da notícia 5
```

**Total**: ~40 segundos para 5 notícias

---

## 8. CONTROLE DE PRIMEIRA CARGA

```typescript
const isFirstLoad = useRef(true);

const checkForNewItems = useCallback((newItems: FeedItem[]) => {
  if (isFirstLoad.current) {
    isFirstLoad.current = false;
    previousItemsRef.current = newItems.map(i => i.id);
    return; // NÃO FALAR na primeira carga
  }

  // Só fala a partir do segundo fetch (30s depois)
  const brandNewItems = newItems.filter(item => !previousIds.has(item.id));
  // ...
}, [autoSpeak]);
```

**Motivo**: Evitar falar 35-40 notícias ao carregar a página.
**Comportamento**: Só fala notícias novas que aparecerem DEPOIS da primeira carga.

---

## 9. CONSOLE LOGS

### Ao Carregar Vozes:
```
📢 Vozes disponíveis:
  - Microsoft David Desktop - English (United States) (en-US)
  - Google UK English Male (en-GB) ⭐
  - Alex (en-US)
  ...
```

### Ao Detectar Novos Itens:
```
📢 5 novas notícias detectadas!
```

### Durante Fala:
```
🎤 Auto-falando: News from BBC: Apple announces new breakthrough...
```

### Se Erro:
```
BBC fetch error: [erro]
Wired fetch error: [erro]
4chan /biz/ fetch error: [erro]
```

---

## 10. EXEMPLO DE SESSÃO COMPLETA

### T=0s (Página Carrega):
```
- Busca 10 fontes
- Coleta ~35 itens
- Mostra todos no feed
- Não fala nada (primeira carga)
```

### T=30s (Primeiro Auto-Update):
```
- Busca 10 fontes novamente
- Detecta 3 novos itens:
  1. BBC: "AI breakthrough"
  2. 4chan /biz/: "Buy signal thread"
  3. Decrypt: "Bitcoin hits new high"

- Fala:
  T=30s: "News from BBC: AI breakthrough"
  T=38s: "News from 4CHAN /BIZ/: Buy signal thread"
  T=46s: "News from DECRYPT: Bitcoin hits new high"
```

### T=60s (Segundo Auto-Update):
```
- Busca 10 fontes
- Detecta 1 novo item:
  1. Moonshot: "Token X hits $1M"

- Fala:
  T=60s: "Attention! MOONSHOT ALERT: Token X hits $1M market cap..."
```

### T=90s, 120s, 150s, ...
```
- Continua buscando a cada 30s
- Fala apenas itens novos
- Usuário pode desligar com toggle
```

---

## 11. TESTAR

### 1. Reiniciar servidor:
```bash
Ctrl+C
npm run dev
```

### 2. Abrir http://localhost:3000

### 3. Verificar console (F12):
```
📢 Vozes disponíveis: [lista]
```

### 4. Verificar Knowledge Base:
- Ver ícones diferentes por fonte:
  - 📺 BBC
  - ⚡ Wired
  - 🍀 4chan
  - 🔐 Decrypt
  - 🧱 The Block
  - 💎 CoinTelegraph

### 5. Ver toggle de voz:
- "🔊 Voice ON" (verde) = auto-fala ativada
- Clicar para desativar
- "🔇 Voice OFF" (cinza) = auto-fala desativada

### 6. Aguardar 30 segundos:
- Novos itens são detectados
- Console mostra: "📢 X novas notícias detectadas!"
- Alon começa a falar automaticamente
- 8 segundos entre cada notícia

### 7. Observar:
- Boca do personagem mexe
- "Speaking..." indicator aparece
- Posts novos têm badge "NEW"
- Alertas aparecem no topo

### 8. Testar toggle:
- Clicar "Voice ON" → desativa → para de falar
- Clicar "Voice OFF" → ativa → volta a falar

---

## 12. FONTES RSS2JSON

**Todas as fontes RSS usam o serviço gratuito RSS2JSON:**

**URL**: `https://api.rss2json.com/v1/api.json?rss_url=[RSS_URL]`

**Vantagem**: Converte RSS XML para JSON (mais fácil de parsear)

**Limite**: Gratuito sem API key (uso razoável)

**Fontes que usam RSS2JSON:**
1. BBC Tech
2. Wired
3. CoinTelegraph
4. Decrypt
5. The Block

**Fontes com API nativa:**
1. CoinGecko (API REST)
2. DexScreener (API REST)
3. Alternative.me (API REST)
4. 4chan (API JSON nativa)

---

## 13. 4CHAN API

**Documentação**: https://github.com/4chan/4chan-API

**Endpoints:**
```
GET https://a.4cdn.org/{board}/catalog.json
```

**Formato da resposta:**
```json
[
  {
    "page": 1,
    "threads": [
      {
        "no": 123456,           // Thread ID
        "sub": "Thread title",  // Subject (opcional)
        "com": "Thread text",   // Comment/body
        "replies": 42,          // Reply count
        "time": 1706563200      // Unix timestamp
      }
    ]
  }
]
```

**Filtro implementado:**
- Apenas threads com `replies > 10` (engajamento)
- Top 2 threads por board
- Máximo 5 threads total

**Limpeza de HTML:**
```typescript
const cleanSubject = subject.replace(/<[^>]*>/g, '').slice(0, 80);
```

---

## 14. RESULTADO ESPERADO

✅ **10+ fontes de notícias** ativas
✅ **~35-40 itens** por fetch
✅ **Auto-fala** de todas as notícias novas
✅ **Delay de 8 segundos** entre cada fala
✅ **Toggle ON/OFF** para controlar voz
✅ **Ícones únicos** por fonte
✅ **Console logs** detalhados
✅ **Primeira carga** não fala (evita spam)
✅ **Detecção de novos itens** funcional
✅ **Boca do personagem** mexe durante fala
✅ **Indicador "Speaking..."** aparece
✅ **Atualização a cada 30s** contínua

---

**Implementado em: 2026-01-29 23:55**
**Status: ✅ COMPLETO**

**Alon agora monitora 10+ fontes e fala TODAS as notícias novas automaticamente!** 🔊📰🌍✨

---

## 15. TABELA RESUMO FINAL

| Fonte | Tipo | Ícone | Limite | Auto-Fala |
|-------|------|-------|--------|-----------|
| CoinGecko | Market | 🦎 | 3 | ✅ |
| Alternative.me | Sentiment | 🔮 | 1 | ✅ |
| DexScreener Trending | Tokens | 📊 | 3 | ✅ |
| DexScreener Moonshots | Tokens | 🚀 | 3 | ✅ |
| CoinTelegraph | Crypto News | 💎 | 5 | ✅ |
| Decrypt | Crypto News | 🔐 | 3 | ✅ |
| The Block | Crypto News | 🧱 | 3 | ✅ |
| BBC Tech | Tech News | 📺 | 3 | ✅ |
| Wired | Tech/Culture | ⚡ | 3 | ✅ |
| 4chan /biz/ | Finance | 🍀 | 2 | ✅ |
| 4chan /g/ | Tech | 🍀 | 2 | ✅ |
| 4chan /fit/ | Fitness | 🍀 | 2 | ✅ |
| 4chan /fa/ | Fashion | 🍀 | 2 | ✅ |

**Total**: 35+ itens, todos com auto-fala! 🎙️
