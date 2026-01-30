# 🚀 Deploy Automático - ALON TERMINAL

## 📋 Configuração Inicial

### 1. Configurar GitHub Secrets (apenas uma vez)

No seu repositório GitHub, vá em **Settings > Secrets and variables > Actions** e adicione:

```
VERCEL_TOKEN=seu_token_aqui
VERCEL_ORG_ID=seu_org_id_aqui
VERCEL_PROJECT_ID=seu_project_id_aqui
ELEVENLABS_API_KEY=sua_api_key_aqui
ELEVENLABS_VOICE_ID=seu_voice_id_aqui
```

#### Como obter os valores:

**VERCEL_TOKEN:**
1. Acesse https://vercel.com/account/tokens
2. Crie um novo token
3. Copie o valor

**VERCEL_ORG_ID e VERCEL_PROJECT_ID:**
```bash
# Instale Vercel CLI (se ainda não instalou)
npm i -g vercel

# Faça login
vercel login

# Link o projeto
vercel link

# Os IDs estarão em .vercel/project.json
cat .vercel/project.json
```

### 2. Configurar Vercel (apenas uma vez)

```bash
# Instalar Vercel CLI globalmente
npm i -g vercel

# Login no Vercel
vercel login

# Link o projeto
vercel link

# Deploy inicial
vercel --prod
```

---

## 🎯 Como Usar - Scripts Rápidos

### Commit e Push Rápido

```bash
# Commit com mensagem customizada + push
npm run commit "Sua mensagem aqui"

# Exemplo:
npm run commit "Add: Nova funcionalidade X"
npm run commit "Fix: Corrigir bug Y"
npm run commit "Update: Melhorar performance Z"
```

### Deploy Completo (Build + Commit + Push)

```bash
# Build, commit, push e auto-deploy via GitHub Actions
npm run ship "Deploy: Nova versão"

# Ou simplesmente:
npm run ship
```

### Deploy Manual no Vercel

```bash
# Deploy production
npm run deploy

# Deploy preview
npm run deploy:preview
```

---

## 🔄 Workflow Automático

### Quando você faz push para `main`:

1. ✅ **GitHub Actions detecta o push**
2. ✅ **Instala dependências**
3. ✅ **Roda build**
4. ✅ **Deploy automático no Vercel (production)**
5. ✅ **Vercel atualiza o site**

### Quando você abre Pull Request:

1. ✅ **GitHub Actions detecta o PR**
2. ✅ **Instala dependências**
3. ✅ **Roda build**
4. ✅ **Deploy preview no Vercel**
5. ✅ **Comenta no PR com link do preview**

---

## 📝 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run commit "msg"` | Commit com mensagem + push automático |
| `npm run ship "msg"` | Build + Commit + Push + Deploy via GitHub |
| `npm run deploy` | Deploy manual para production (Vercel) |
| `npm run deploy:preview` | Deploy manual para preview (Vercel) |
| `npm run push` | Push rápido (sem commit) |

---

## 🎨 Exemplos de Uso

### Caso 1: Mudança rápida

```bash
# Faça suas alterações no código...

# Commit + Push automático
npm run commit "Update: Melhorar UI do header"

# GitHub Actions vai fazer o deploy automaticamente!
```

### Caso 2: Deploy importante (com build local)

```bash
# Faça suas alterações no código...

# Testa build local + Commit + Push + Deploy
npm run ship "Deploy: Nova versão 2.0"

# GitHub Actions vai deployar!
```

### Caso 3: Deploy manual urgente

```bash
# Faça suas alterações no código...
git add .
git commit -m "Hotfix: Corrigir bug crítico"
git push

# Deploy manual direto no Vercel
npm run deploy
```

---

## 🔍 Verificar Status do Deploy

### GitHub Actions:
https://github.com/NeuTr0n244/alon/actions

### Vercel Dashboard:
https://vercel.com/dashboard

---

## 🛠️ Troubleshooting

### Build falhou no GitHub Actions?

1. Verifique os logs: https://github.com/NeuTr0n244/alon/actions
2. Certifique-se que as secrets estão configuradas
3. Teste build local: `npm run build`

### Deploy falhou no Vercel?

1. Verifique no dashboard: https://vercel.com/dashboard
2. Verifique variáveis de ambiente no Vercel
3. Tente deploy manual: `npm run deploy`

### Vercel CLI não está funcionando?

```bash
# Reinstalar Vercel CLI
npm i -g vercel@latest

# Fazer login novamente
vercel login

# Re-link do projeto
vercel link
```

---

## ⚡ Workflow Recomendado

**Para mudanças normais:**
```bash
npm run commit "Update: Descrição da mudança"
```

**Para deploys importantes:**
```bash
npm run ship "Deploy: Versão X.Y.Z"
```

**Para testes de preview:**
```bash
npm run deploy:preview
```

---

## 📚 Arquivos de Configuração

- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `vercel.json` - Configuração do Vercel
- `scripts/commit.js` - Script de commit automático
- `scripts/ship.js` - Script de deploy completo

---

## ✅ Checklist de Setup

- [ ] Instalar Vercel CLI: `npm i -g vercel`
- [ ] Login no Vercel: `vercel login`
- [ ] Link projeto: `vercel link`
- [ ] Adicionar GitHub Secrets (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
- [ ] Adicionar GitHub Secrets (ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID)
- [ ] Testar: `npm run commit "Test: Setup automático"`
- [ ] Verificar deploy: https://github.com/NeuTr0n244/alon/actions

---

## 🎉 Pronto!

Agora você tem deploy automático configurado! Toda vez que fizer push para `main`, o GitHub Actions vai buildar e deployar automaticamente no Vercel.

**Happy shipping! 🚀**
