# 🚀 AUTO-DEPLOY SETUP - PASSO A PASSO

## ✅ CHECKLIST DE CONFIGURAÇÃO

### FASE 1: Instalar Vercel CLI

```bash
# Instalar globalmente
npm install -g vercel

# Verificar instalação
vercel --version
```

---

### FASE 2: Login e Link do Projeto

```bash
# 1. Fazer login no Vercel
vercel login

# 2. Navegar para o projeto
cd C:\Users\NEUTRON\Documents\alon

# 3. Link do projeto (responda as perguntas)
vercel link

# Perguntas:
# - Set up and deploy? → Y
# - Which scope? → Seu username/org
# - Link to existing project? → N (primeira vez) ou Y (se já existe)
# - What's your project's name? → alon-terminal
# - In which directory is your code located? → ./

# 4. Verificar se criou a pasta .vercel
ls .vercel
```

---

### FASE 3: Obter IDs do Vercel

```bash
# Ver os IDs do projeto
cat .vercel/project.json

# Exemplo de output:
# {
#   "orgId": "team_xxxxxxxxxxxxx",
#   "projectId": "prj_xxxxxxxxxxxxx"
# }
```

**Copie esses valores! Você vai precisar deles para os GitHub Secrets.**

---

### FASE 4: Obter Token do Vercel

1. Acesse: https://vercel.com/account/tokens
2. Clique em **"Create Token"**
3. Nome: `GitHub Actions - ALON TERMINAL`
4. Scope: **Full Access**
5. Expiration: **No Expiration** (ou defina um período)
6. Clique em **"Create"**
7. **COPIE O TOKEN** (você só verá uma vez!)

---

### FASE 5: Configurar GitHub Secrets

1. Vá para: https://github.com/NeuTr0n244/alon/settings/secrets/actions

2. Clique em **"New repository secret"** e adicione:

**Secret 1:**
```
Name: VERCEL_TOKEN
Value: [token copiado no passo 4]
```

**Secret 2:**
```
Name: VERCEL_ORG_ID
Value: [orgId do .vercel/project.json]
```

**Secret 3:**
```
Name: VERCEL_PROJECT_ID
Value: [projectId do .vercel/project.json]
```

**Secret 4:**
```
Name: ELEVENLABS_API_KEY
Value: [sua API key do ElevenLabs]
```

**Secret 5:**
```
Name: ELEVENLABS_VOICE_ID
Value: [seu Voice ID do ElevenLabs]
```

---

### FASE 6: Configurar Variáveis de Ambiente no Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto **alon-terminal**
3. Vá em **Settings > Environment Variables**
4. Adicione:

```
ELEVENLABS_API_KEY = [sua chave]
ELEVENLABS_VOICE_ID = [seu voice ID]
```

5. Selecione: **Production, Preview, Development**
6. Clique em **Save**

---

### FASE 7: Fazer Deploy Inicial

```bash
# Deploy para production
vercel --prod

# Aguarde o deploy...
# Vercel vai dar o URL do seu site
```

---

### FASE 8: Testar Auto-Deploy

```bash
# Fazer uma mudança qualquer
echo "# Test" >> test.txt

# Commit e push
npm run commit "Test: Auto-deploy setup"

# Aguarde 1-2 minutos e verifique:
# 1. GitHub Actions: https://github.com/NeuTr0n244/alon/actions
# 2. Vercel Dashboard: https://vercel.com/dashboard
```

---

## 🎯 VERIFICAÇÃO FINAL

### ✅ Vercel CLI instalado?
```bash
vercel --version
```

### ✅ Projeto linkado?
```bash
cat .vercel/project.json
```

### ✅ GitHub Secrets configurados?
- [ ] VERCEL_TOKEN
- [ ] VERCEL_ORG_ID
- [ ] VERCEL_PROJECT_ID
- [ ] ELEVENLABS_API_KEY
- [ ] ELEVENLABS_VOICE_ID

### ✅ Variáveis no Vercel?
- [ ] ELEVENLABS_API_KEY
- [ ] ELEVENLABS_VOICE_ID

### ✅ Deploy funcionando?
```bash
npm run commit "Test: Auto-deploy"
```

---

## 🔍 TROUBLESHOOTING

### Problema: Vercel CLI não encontrado

**Windows:**
```bash
npm install -g vercel
# Feche e reabra o terminal
vercel --version
```

**Se ainda não funcionar:**
```bash
# Usar npx
npx vercel login
npx vercel link
```

---

### Problema: GitHub Actions falhando

1. Verifique os logs: https://github.com/NeuTr0n244/alon/actions
2. Certifique-se que todos os 5 secrets estão configurados
3. Verifique se os valores estão corretos (sem espaços extras)

---

### Problema: Build falhando

```bash
# Teste o build local
npm run build

# Se falhar, corrija os erros antes de fazer push
```

---

### Problema: Deploy não acontece

1. Verifique se o push foi para a branch `main`
2. Verifique GitHub Actions
3. Verifique Vercel Dashboard

---

## 📱 COMANDOS ÚTEIS

```bash
# Ver status do Vercel
vercel ls

# Ver logs do último deploy
vercel logs

# Ver informações do projeto
vercel inspect

# Remover link (se precisar refazer)
rm -rf .vercel
vercel link
```

---

## 🎉 PRONTO!

Após completar todos os passos, você terá:

✅ Deploy automático em cada push para `main`
✅ Preview deployments em Pull Requests
✅ Comandos npm para commit/deploy rápido
✅ CI/CD completo configurado

**Agora é só usar:**

```bash
npm run commit "Sua mensagem"
```

**E o resto é automático! 🚀**

---

## 📚 Links Importantes

- **GitHub Actions:** https://github.com/NeuTr0n244/alon/actions
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Tokens:** https://vercel.com/account/tokens
- **GitHub Secrets:** https://github.com/NeuTr0n244/alon/settings/secrets/actions

---

**Dúvidas? Veja [DEPLOY.md](./DEPLOY.md) para mais detalhes.**
