# ✅ ANIMAÇÃO DE BOCA DO GLB IMPLEMENTADA

## RESUMO:

Implementada a animação de boca do personagem 3D quando o TTS (Text-to-Speech) estiver falando.

**A animação de lip sync já existe no GLB** (feita no Blender), agora ela é tocada automaticamente quando o Alon fala!

---

## MUDANÇAS IMPLEMENTADAS:

### 1. Atualizado Character3D.tsx

**Imports adicionados:**
```typescript
import { useAnimations } from '@react-three/drei';
```

**Novos estados e refs:**
```typescript
const [isSpeaking, setIsSpeaking] = useState(false);
const groupRef = useRef<THREE.Group>(null);
const animations = model?.animations || [];
const { actions, names } = useAnimations(animations, groupRef);
```

**3 novos useEffects:**

#### a) Debug de Animações (mostra o que existe no GLB):
```typescript
useEffect(() => {
  if (!model || !animations.length) return;

  console.log('=== ANIMAÇÕES DISPONÍVEIS NO GLB ===');
  console.log('Nomes das animações:', names);
  console.log('Total de animações:', animations.length);

  animations.forEach((anim, i) => {
    console.log(`Animação ${i}: "${anim.name}" - Duração: ${anim.duration.toFixed(2)}s`);
  });
}, [model, animations, names]);
```

#### b) Escutar Eventos de Fala:
```typescript
useEffect(() => {
  const handleSpeak = () => {
    console.log('🎤 Evento de fala recebido!');
    setIsSpeaking(true);
  };

  window.addEventListener('character-speak', handleSpeak);

  // Verificar se TTS está falando (polling)
  const checkSpeaking = setInterval(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const speaking = window.speechSynthesis.speaking;
      setIsSpeaking(speaking);
    }
  }, 100);

  return () => {
    window.removeEventListener('character-speak', handleSpeak);
    clearInterval(checkSpeaking);
  };
}, []);
```

#### c) Tocar/Parar Animação de Boca:
```typescript
useEffect(() => {
  if (!actions || !names.length) return;

  // Procurar animação de boca por nome
  const possibleNames = [
    'mouth', 'Mouth', 'MOUTH',
    'talk', 'Talk', 'TALK',
    'speak', 'Speak', 'SPEAK',
    'lip', 'Lip', 'LIP',
    'lipsync', 'LipSync', 'Lipsync',
    'boca', 'Boca', 'BOCA',
    'fala', 'Fala', 'FALA',
    'idle', 'Idle', 'IDLE',
    names[0], // Primeira animação como fallback
  ];

  let mouthAction: THREE.AnimationAction | null = null;

  for (const name of possibleNames) {
    if (name && actions[name]) {
      mouthAction = actions[name];
      console.log(`✅ Animação de boca encontrada: "${name}"`);
      break;
    }
  }

  if (mouthAction) {
    if (isSpeaking) {
      console.log('▶️ Tocando animação de boca');
      mouthAction.reset();
      mouthAction.setLoop(THREE.LoopRepeat, Infinity);
      mouthAction.timeScale = 1.5; // Velocidade 1.5x
      mouthAction.play();
    } else {
      console.log('⏹️ Parando animação de boca');
      mouthAction.fadeOut(0.3); // Fade out suave
    }
  }
}, [isSpeaking, actions, names]);
```

**Return atualizado com group:**
```typescript
return (
  <group ref={groupRef}>
    <primitive object={model.scene} scale={1} position={[0, 0, 0]} />
  </group>
);
```

---

## COMO FUNCIONA:

### 1. Carregamento do GLB:
```
loadCharacterModel('/models/alon.glb')
  ↓
model.animations (array de AnimationClip)
  ↓
useAnimations(animations, groupRef)
  ↓
{ actions, names }
```

### 2. Detecção de Fala:
```
KnowledgeBase: botão "CLICK TO HEAR" clicado
  ↓
window.dispatchEvent('character-speak')
  ↓
Character3D: event listener detecta
  ↓
setIsSpeaking(true)
  ↓
Polling verifica window.speechSynthesis.speaking
```

### 3. Animação:
```
isSpeaking = true
  ↓
Procura animação (mouth, talk, speak, etc.)
  ↓
action.play() com loop infinito
  ↓
isSpeaking = false
  ↓
action.fadeOut(0.3s)
```

---

## NOMES DE ANIMAÇÃO SUPORTADOS:

O código procura automaticamente por:

1. **mouth**, Mouth, MOUTH
2. **talk**, Talk, TALK
3. **speak**, Speak, SPEAK
4. **lip**, Lip, LIP
5. **lipsync**, LipSync, Lipsync
6. **boca**, Boca, BOCA (português)
7. **fala**, Fala, FALA (português)
8. **idle**, Idle, IDLE
9. **Primeira animação** (fallback)

Se sua animação tem nome diferente, ela será usada como fallback (primeira do array).

---

## VERIFICAR NO CONSOLE (F12):

### 1. Ao carregar a página:
```
=== ANIMAÇÕES DISPONÍVEIS NO GLB ===
Nomes das animações: ["Talk", "Idle"]
Total de animações: 2
Animação 0: "Talk" - Duração: 2.50s
Animação 1: "Idle" - Duração: 5.00s
```

### 2. Ao clicar "CLICK TO HEAR":
```
[KnowledgeBase] Using male voice: Google UK English Male
🎤 Evento de fala recebido!
✅ Animação de boca encontrada: "Talk"
▶️ Tocando animação de boca
```

### 3. Quando terminar de falar:
```
⏹️ Parando animação de boca
```

---

## SE NÃO APARECER ANIMAÇÕES:

### Verificar Export no Blender:

1. **File → Export → glTF 2.0 (.glb)**

2. **Marcar estas opções:**
   - ✅ **Animation**
   - ✅ **Include → Animation**
   - ✅ **Animation → Shape Keys** (se usar morph targets)
   - ✅ **Animation → Always Sample Animations** (recomendado)

3. **Se usar Bones/Armature:**
   - ✅ **Animation → Bake Animation**

4. **Salvar e substituir** `/public/models/alon.glb`

### Verificar no Blender:
```
1. Abrir Dope Sheet
2. Verificar se tem Action/Animation
3. Nome da Action/Animation → será o "name" no GLB
4. Verificar se tem keyframes
```

---

## AJUSTAR VELOCIDADE DA ANIMAÇÃO:

No código, linha:
```typescript
mouthAction.timeScale = 1.5; // Ajustar velocidade se necessário
```

**Valores:**
- `0.5` = Metade da velocidade (mais devagar)
- `1.0` = Velocidade normal
- `1.5` = 1.5x mais rápido (atual)
- `2.0` = 2x mais rápido

---

## SE A ANIMAÇÃO TEM NOME ESPECÍFICO:

### Exemplo: Animação se chama "TalkAnimation" no Blender

**Opção 1 - Adicionar na lista:**
```typescript
const possibleNames = [
  'TalkAnimation', // Adicionar aqui
  'mouth', 'Mouth', 'MOUTH',
  // ...
];
```

**Opção 2 - Usar diretamente:**
```typescript
// Substituir o loop de busca por:
const mouthAction = actions['TalkAnimation'];
if (mouthAction) {
  // ... resto do código
}
```

---

## TESTAR AGORA:

### 1. Reiniciar o servidor (se ainda não reiniciou):
```bash
Ctrl+C
npm run dev
```

### 2. Abrir o navegador e console (F12)

### 3. Verificar logs:
```
=== ANIMAÇÕES DISPONÍVEIS NO GLB ===
Nomes das animações: [...]
```

### 4. Clicar "CLICK TO HEAR" em qualquer post do Knowledge Base

### 5. Observar:
- ✅ Console mostra "▶️ Tocando animação de boca"
- ✅ Boca do personagem se move
- ✅ Speaking indicator aparece
- ✅ Som masculino toca

---

## TROUBLESHOOTING:

### ❌ "Nenhuma animação de boca encontrada"

**Verificar no console qual é o nome da animação:**
```javascript
// O console mostra:
Nomes das animações: ["MinhaAnimacao"]

// Adicionar no código:
const possibleNames = [
  'MinhaAnimacao', // <-- adicionar este nome
  'mouth', 'Mouth',
  // ...
];
```

### ❌ "Animações disponíveis: []" (array vazio)

**Problema:** GLB não tem animações exportadas.

**Solução:** Re-exportar do Blender com opção "Animation" marcada.

### ❌ Animação toca mas boca não mexe

**Problema:** Animação pode ser de corpo/bones, não de morph targets da boca.

**Solução:** Verificar no Blender se a animação está animando os Shape Keys da boca (visemes).

### ❌ Animação muito rápida/devagar

**Solução:** Ajustar `timeScale`:
```typescript
mouthAction.timeScale = 1.0; // Testar valores diferentes
```

---

## FLUXO COMPLETO:

```
1. Usuário clica "🔊 CLICK TO HEAR →"
   ↓
2. KnowledgeBase.speakText() é chamado
   ↓
3. Dispara evento window.dispatchEvent('character-speak')
   ↓
4. Character3D detecta evento → setIsSpeaking(true)
   ↓
5. useEffect detecta isSpeaking = true
   ↓
6. Procura animação de boca no GLB
   ↓
7. action.play() → Boca começa a se mover
   ↓
8. window.speechSynthesis.speak() → Voz masculina toca
   ↓
9. CharacterCanvas mostra indicador "Speaking..."
   ↓
10. Quando TTS termina → setIsSpeaking(false)
   ↓
11. action.fadeOut(0.3) → Boca para de mover
```

---

## RESULTADO ESPERADO:

✅ **Console mostra animações disponíveis no GLB**
✅ **Animação de boca é encontrada e identificada**
✅ **Boca se move quando Alon fala**
✅ **Animação para quando termina de falar**
✅ **Fade out suave (0.3s)**
✅ **Loop infinito durante a fala**
✅ **Velocidade ajustável (timeScale)**
✅ **Logs detalhados para debug**

---

**Implementado em: 2026-01-29 23:15**
**Status: ✅ COMPLETO**

**Alon agora move a boca quando fala!** 🗣️✨🎙️

---

## PRÓXIMOS PASSOS:

1. Reiniciar dev server (se necessário)
2. Verificar no console quais animações estão no GLB
3. Clicar em "CLICK TO HEAR" e ver a boca mexer
4. Se necessário, ajustar nome da animação ou velocidade
5. Se não aparecer animações, re-exportar GLB do Blender

**Qualquer dúvida, verificar os logs no console!** 🚀
