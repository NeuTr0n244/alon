# 🔊 CONFIGURAÇÃO DE VOZ - ALON TERMINAL

## ✅ IMPLEMENTADO

### 📋 REGRAS DE LEITURA

| Tipo | Comportamento | Quando |
|------|---------------|--------|
| **NEWS** 📰 | Ler IMEDIATAMENTE | Assim que chega |
| **ALERT** 🔔 | Acumular e ler em lote | A cada 5 minutos |
| **MARKET** 📈 | NÃO ler | Ignorado |
| **PREDICTION** 🔮 | NÃO ler | Ignorado |
| **MOONSHOT** 🚀 | NÃO ler | Ignorado |
| **TRENDING** 📊 | NÃO ler | Ignorado |

---

## 🎯 COMO FUNCIONA

### 1. **PRIMEIRA CARGA**

Quando o app carrega pela primeira vez:
- ✅ Adiciona todas as **NEWS** à fila de leitura
- ✅ Acumula todos os **ALERTS** (não lê ainda)
- ✅ Marca outros tipos como vistos (mas não lê)

**Logs esperados:**
```
🎬 PRIMEIRA CARGA - Adicionando apenas NEWS à fila
➕ NEWS 1 adicionado à fila: Bitcoin reaches new all-time high...
➕ NEWS 2 adicionado à fila: Solana network upgrade complete...
✅ Primeira carga: 5 NEWS na fila, 3 ALERTS acumulados
```

---

### 2. **NOVOS ITEMS CHEGANDO**

Quando novos items são detectados (atualização a cada 30s):

**NEWS:**
```javascript
📰 NEWS adicionado à fila: Breaking: New crypto regulation...
```
→ Vai DIRETO para a fila de leitura

**ALERT:**
```javascript
🔔 ALERT acumulado (3 total): Trending token XYZ gaining attention...
```
→ Fica ACUMULADO, aguardando 5 minutos

**OUTROS (market, prediction, etc):**
```javascript
⏭️ Tipo ignorado (market): Solana trending: SOL $150...
⏭️ Tipo ignorado (prediction): Market sentiment is bullish...
```
→ NÃO entra na fila

---

### 3. **LEITURA DE ALERTAS (A cada 5 minutos)**

Timer verifica a cada 1 minuto se já passou 5 minutos desde a última leitura.

**Quando completa 5 minutos:**
```javascript
⏰ 5 MINUTOS - Lendo 3 alertas acumulados

// Primeiro: Resumo
🔊 "Alert summary. 3 alerts in the last 5 minutes."

// Depois: Cada alerta
🔊 Lendo alerta 1: Alert! Trending number 1: Token ABC...
🔊 Lendo alerta 2: Alert! Trending number 2: Token XYZ...
🔊 Lendo alerta 3: Alert! Trending number 3: Token DEF...

✅ Alertas lidos. Próxima leitura em 5 minutos.
```

**Timer reseta** → Aguarda mais 5 minutos → Repete o processo

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### Refs de Controle

```typescript
const lastAlertReadTime = useRef<number>(Date.now());
const pendingAlerts = useRef<FeedItem[]>([]);
const ALERT_INTERVAL = 5 * 60 * 1000; // 5 minutos
```

### Processamento de Novos Items

```typescript
// Se for NEWS → Ler imediato
if (item.type === 'news') {
  addToQueue(formatTextForSpeech(item), item.id);
  console.log(`📰 NEWS adicionado à fila`);
}

// Se for ALERT → Acumular
else if (item.type === 'alert') {
  pendingAlerts.current.push(item);
  console.log(`🔔 ALERT acumulado (${pendingAlerts.current.length} total)`);
}

// Outros → Ignorar
else {
  console.log(`⏭️ Tipo ignorado (${item.type})`);
}
```

### Timer de Alertas

```typescript
useEffect(() => {
  const checkAlerts = setInterval(() => {
    const now = Date.now();
    const timeSinceLastRead = now - lastAlertReadTime.current;

    if (timeSinceLastRead >= ALERT_INTERVAL && pendingAlerts.current.length > 0) {
      // Ler resumo
      addToQueue(`Alert summary. ${pendingAlerts.current.length} alerts...`);

      // Ler cada alerta
      pendingAlerts.current.forEach(alert => {
        addToQueue(formatTextForSpeech(alert), alert.id);
      });

      // Limpar e resetar
      pendingAlerts.current = [];
      lastAlertReadTime.current = now;
    }
  }, 60000); // Check a cada 1 minuto

  return () => clearInterval(checkAlerts);
}, [isEnabled, isUnlocked]);
```

---

## 📊 EXEMPLO DE FLUXO

### Timeline de 10 minutos:

```
00:00 - App carrega
        ✅ 5 NEWS adicionadas à fila (lê agora)
        ✅ 3 ALERTS acumulados (aguarda)

00:30 - Atualização automática
        📰 1 nova NEWS → Lê imediato
        🔔 2 novos ALERTS → Acumula (total: 5 alerts)
        ⏭️ 3 MARKET updates → Ignora

01:00 - Atualização automática
        📰 2 novas NEWS → Lê imediato
        🔔 1 novo ALERT → Acumula (total: 6 alerts)

...

05:00 - ⏰ TIMER DE ALERTAS!
        🔊 "Alert summary. 6 alerts in the last 5 minutes."
        🔊 Lê os 6 alertas acumulados
        ✅ Limpa fila de alertas
        ⏱️ Próxima leitura: 10:00

05:30 - Atualização automática
        📰 1 nova NEWS → Lê imediato
        🔔 1 novo ALERT → Acumula (total: 1 alert)

...

10:00 - ⏰ TIMER DE ALERTAS!
        🔊 "Alert summary. X alerts in the last 5 minutes."
        🔊 Lê alertas acumulados
        ✅ Limpa fila
        ⏱️ Próxima leitura: 15:00
```

---

## 🎤 FORMATO DA LEITURA

### NEWS (Imediato):
```
"News. From BBC. Bitcoin reaches new all-time high of $100,000."
"News. From COINTELEGRAPH. Solana network completes major upgrade."
```

### ALERTS (A cada 5 minutos):
```
"Alert summary. 3 alerts in the last 5 minutes."
"Alert! From DEXSCREENER. Trending number 1: Token ABC is gaining attention on DexScreener"
"Alert! From DEXSCREENER. Trending number 2: Token XYZ is gaining attention on DexScreener"
```

---

## 🔍 DEBUGGING

### Logs no Console:

**Primeira carga:**
```
🎬 PRIMEIRA CARGA - Adicionando apenas NEWS à fila
Voice enabled: true Voice unlocked: true
➕ NEWS 1 adicionado à fila: Bitcoin reaches...
➕ NEWS 2 adicionado à fila: Solana network...
✅ Primeira carga: 5 NEWS na fila, 3 ALERTS acumulados
```

**Novos items:**
```
📢 8 novos itens detectados!
📰 NEWS adicionado à fila: Breaking news...
🔔 ALERT acumulado (4 total): Trending token...
⏭️ Tipo ignorado (market): Solana trending...
⏭️ Tipo ignorado (prediction): Market sentiment...
```

**Timer de alertas:**
```
⏰ 5 MINUTOS - Lendo 4 alertas acumulados
🔊 Lendo alerta 1: Alert! Trending number 1...
🔊 Lendo alerta 2: Alert! Trending number 2...
✅ Alertas lidos. Próxima leitura em 5 minutos.
```

---

## ⚙️ CONFIGURAÇÃO

### Alterar intervalo de alertas:

Edite `KnowledgeBase.tsx`:

```typescript
const ALERT_INTERVAL = 5 * 60 * 1000; // 5 minutos

// Para 10 minutos:
const ALERT_INTERVAL = 10 * 60 * 1000;

// Para 3 minutos:
const ALERT_INTERVAL = 3 * 60 * 1000;
```

### Desabilitar leitura de alertas:

Comente o `useEffect` do timer:

```typescript
// useEffect(() => {
//   const checkAlerts = setInterval(() => { ... }, 60000);
//   return () => clearInterval(checkAlerts);
// }, [isEnabled, isUnlocked]);
```

### Ativar leitura de outros tipos:

Modifique a lógica de processamento:

```typescript
// Para ler MARKET também:
if (item.type === 'news' || item.type === 'market') {
  addToQueue(formatTextForSpeech(item), item.id);
}
```

---

## 📝 RESUMO

✅ **NEWS** → Lê IMEDIATAMENTE quando chega
✅ **ALERTS** → Acumula e lê A CADA 5 MINUTOS
✅ **Outros** → IGNORA (não lê automaticamente)

**Resultado:**
- Menos poluição sonora
- Foco em notícias importantes
- Alertas agrupados para eficiência
- Usuário pode clicar em qualquer item para ler manualmente

---

**Atualizado em:** 2026-01-30
**Versão:** 1.0
**Status:** ✅ Implementado e em produção
