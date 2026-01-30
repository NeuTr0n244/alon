# 🎯 INSTRUÇÕES PARA TESTAR ANIMAÇÃO DE BOCA

## O QUE FOI IMPLEMENTADO:

✅ **Voz masculina no TTS** (pitch = 0.85, busca vozes David/James/Daniel)
✅ **Animação de boca do GLB** tocando quando Alon fala
✅ **Detecção automática** da animação de boca no arquivo GLB
✅ **Logs detalhados** no console para debug

---

## PASSO A PASSO PARA TESTAR:

### 1️⃣ REINICIAR O DEV SERVER (SE NECESSÁRIO)

```bash
# No terminal onde está rodando npm run dev:
Ctrl+C

# Depois:
npm run dev
```

**Aguarde:** "✓ Compiled in XXms"

---

### 2️⃣ ABRIR O NAVEGADOR

```
http://localhost:3000
```

**Aguarde:** O personagem 3D carregar

---

### 3️⃣ ABRIR O CONSOLE DO NAVEGADOR

**Chrome/Edge:** Pressione `F12` ou `Ctrl+Shift+I`

**Firefox:** Pressione `F12` ou `Ctrl+Shift+K`

**Safari:** `Cmd+Option+I`

---

### 4️⃣ VERIFICAR LOGS INICIAIS

No console, procure por:

```javascript
=== ANIMAÇÕES DISPONÍVEIS NO GLB ===
Nomes das animações: ["Talk", "Idle"]  // Exemplo
Total de animações: 2
Animação 0: "Talk" - Duração: 2.50s
Animação 1: "Idle" - Duração: 5.00s
```

```javascript
[KnowledgeBase] Available voices: [
  "Microsoft David Desktop - English (United States) (en-US)",
  "Google UK English Male (en-GB)",
  ...
]
```

**✅ BOM SINAL:** Você vê animações listadas e vozes carregadas

**❌ PROBLEMA:** Se não aparecer animações:
- O GLB não tem animações exportadas
- Precisa re-exportar do Blender com "Animation" marcado

---

### 5️⃣ CLICAR "CLICK TO HEAR" NO KNOWLEDGE BASE

**Localização:** Coluna direita → Knowledge Base → Qualquer post

**Botão:** 🔊 CLICK TO HEAR →

---

### 6️⃣ VERIFICAR LOGS NO CONSOLE

Quando clicar, deve aparecer:

```javascript
[KnowledgeBase] Using male voice: Google UK English Male
🎤 Evento de fala recebido!
✅ Animação de boca encontrada: "Talk"
▶️ Tocando animação de boca
```

---

### 7️⃣ OBSERVAR O PERSONAGEM 3D

**DEVE ACONTECER:**

1. ✅ **Som masculino** (voz grave) falando o texto do post
2. ✅ **Boca do personagem se movendo** (animação do GLB tocando)
3. ✅ **Indicador "Speaking..."** na parte inferior do personagem
4. ✅ **Sound wave animado** (5 barras verdes piscando)
5. ✅ **Botão fica verde** enquanto está falando

**Quando terminar de falar:**

```javascript
⏹️ Parando animação de boca
```

6. ✅ **Boca para de mover** (fade out suave 0.3s)
7. ✅ **Indicador desaparece**
8. ✅ **Botão volta ao normal**

---

## 🐛 TROUBLESHOOTING:

### ❌ Não ouve som (mas vê os logs)

**Causa:** Volume do navegador/sistema está mudo

**Solução:**
1. Verificar volume do navegador (ícone na aba)
2. Verificar volume do sistema operacional
3. Testar outro site com som

---

### ❌ "Nenhuma animação de boca encontrada!"

**Console mostra:**
```javascript
❌ Nenhuma animação de boca encontrada!
Animações disponíveis: ["MinhaAnimacao"]
```

**Solução:** O nome da animação não está na lista de nomes possíveis.

**CORRIGIR EM:** `components/character/Character3D.tsx`

```typescript
const possibleNames = [
  'MinhaAnimacao', // <-- ADICIONAR O NOME QUE APARECEU NO CONSOLE
  'mouth', 'Mouth', 'MOUTH',
  'talk', 'Talk', 'TALK',
  // ...
];
```

---

### ❌ "Animações disponíveis: []" (array vazio)

**Console mostra:**
```javascript
=== ANIMAÇÕES DISPONÍVEIS NO GLB ===
Nomes das animações: []
Total de animações: 0
```

**Causa:** GLB não tem animações exportadas do Blender

**Solução:**

#### No Blender:

1. **Abrir o arquivo .blend original**

2. **Verificar se tem animação:**
   - Abrir `Dope Sheet`
   - Ver se tem Action/Animation
   - Ver se tem keyframes

3. **Export → glTF 2.0 (.glb):**
   - ✅ Marcar **"Animation"**
   - ✅ Marcar **"Include → Animation"**
   - ✅ Marcar **"Shape Keys"** (se usar morph targets)
   - ✅ Marcar **"Always Sample Animations"**
   - Se usar bones: ✅ **"Bake Animation"**

4. **Salvar como `/public/models/alon.glb`**

5. **Reiniciar dev server**

---

### ❌ Animação toca mas boca não mexe

**Causa:** A animação pode ser de corpo/bones, não de Shape Keys da boca

**Verificar no Blender:**
1. A animação está animando os **Shape Keys** da boca?
2. Os Shape Keys têm nomes como: mouthOpen, mouthSmile, etc?

**Shape Keys são os morph targets** que movem a boca.

---

### ❌ Animação muito rápida ou devagar

**Solução:** Ajustar velocidade em `Character3D.tsx`:

```typescript
mouthAction.timeScale = 1.5; // ATUAL

// TESTAR:
mouthAction.timeScale = 0.5; // Mais devagar
mouthAction.timeScale = 1.0; // Normal
mouthAction.timeScale = 2.0; // Mais rápido
```

---

### ❌ Voz feminina ao invés de masculina

**Console mostra:**
```javascript
[KnowledgeBase] No male voice found, using default
```

**Causa:** Sistema não tem vozes masculinas instaladas

**Solução:**

#### Windows:
1. Instalar vozes do Windows (Configurações → Hora e Idioma → Fala → Adicionar vozes)
2. Baixar "Microsoft David Desktop"

#### macOS:
1. Já vem com vozes masculinas (Alex, Daniel)
2. Verificar em: Preferências do Sistema → Acessibilidade → Fala

#### Linux:
1. Instalar espeak-ng ou festival
2. Instalar vozes adicionais

**FALLBACK:** Mesmo sem voz masculina, o `pitch = 0.85` deixa a voz mais grave.

---

## ✅ RESULTADO ESPERADO:

Quando tudo funcionar corretamente:

```
1. Clica "CLICK TO HEAR"
   ↓
2. Console: "🎤 Evento de fala recebido!"
   ↓
3. Console: "✅ Animação de boca encontrada: Talk"
   ↓
4. Console: "▶️ Tocando animação de boca"
   ↓
5. Voz masculina começa a falar
   ↓
6. Boca do personagem se move (animação GLB)
   ↓
7. Indicador "Speaking..." aparece
   ↓
8. Termina de falar
   ↓
9. Console: "⏹️ Parando animação de boca"
   ↓
10. Boca para de mover (fade out 0.3s)
```

---

## 📋 CHECKLIST COMPLETO:

- [ ] Dev server reiniciado e compilado com sucesso
- [ ] Página carregou em http://localhost:3000
- [ ] Personagem 3D apareceu
- [ ] Console (F12) aberto
- [ ] Vê "=== ANIMAÇÕES DISPONÍVEIS NO GLB ===" no console
- [ ] Vê lista de vozes disponíveis no console
- [ ] Clicou em "CLICK TO HEAR" no Knowledge Base
- [ ] Ouviu voz masculina/grave
- [ ] Viu boca do personagem se movendo
- [ ] Viu indicador "Speaking..." aparecer
- [ ] Viu botão ficar verde
- [ ] Quando terminou, boca parou de mover
- [ ] Console mostra "▶️ Tocando" e depois "⏹️ Parando"

---

## 🎉 SUCESSO!

Se todos os itens do checklist funcionaram:

**✅ Voz masculina implementada**
**✅ Animação de boca tocando**
**✅ Sincronização perfeita**
**✅ Indicador visual funcionando**

**Alon está falando com voz de homem e mexendo a boca!** 🗣️✨

---

## 📝 PRÓXIMOS PASSOS:

Se quiser ajustar:

1. **Velocidade da animação:** Mudar `timeScale` em Character3D.tsx
2. **Tom da voz:** Mudar `pitch` em KnowledgeBase.tsx (0.7-1.0)
3. **Velocidade da fala:** Mudar `rate` em KnowledgeBase.tsx (0.5-1.5)
4. **Nome da animação:** Adicionar nome específico na lista `possibleNames`

---

**Qualquer problema, verificar os logs no console!** 🚀
