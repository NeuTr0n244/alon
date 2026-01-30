# ⚡ QUICK COMMANDS - ALON TERMINAL

## 🎯 Comandos Mais Usados

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build do projeto
npm run build

# Iniciar servidor de produção
npm start
```

### Deploy e Commit

```bash
# COMMIT RÁPIDO (mais usado)
npm run commit "Add: Nova feature X"
npm run commit "Fix: Corrigir bug Y"
npm run commit "Update: Melhorar Z"

# DEPLOY COMPLETO (build + commit + push)
npm run ship "Deploy: Versão 2.0"

# Deploy manual no Vercel
npm run deploy              # Production
npm run deploy:preview      # Preview
```

## 📋 Workflow Diário

### 1. Fazendo mudanças no código

```bash
# Edite seus arquivos...

# Commit + Push automático
npm run commit "Update: Descrição da mudança"

# Pronto! GitHub Actions vai deployar automaticamente
```

### 2. Deploy importante

```bash
# Edite seus arquivos...

# Build local + Commit + Push
npm run ship "Deploy: Nova versão"

# Verifica status
# https://github.com/NeuTr0n244/alon/actions
```

## 🔥 Exemplos Reais

```bash
# Adicionar nova feature
npm run commit "Add: Botão de share nos tokens"

# Corrigir bug
npm run commit "Fix: Erro ao carregar GLB model"

# Melhorar performance
npm run commit "Update: Otimizar renderização 3D"

# Atualizar estilos
npm run commit "Style: Melhorar UI do header"

# Deploy de versão
npm run ship "Deploy: v2.1.0 - Nova UI"
```

## 📚 Links Úteis

- **GitHub Actions:** https://github.com/NeuTr0n244/alon/actions
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Deploy Guide:** [DEPLOY.md](./DEPLOY.md)
- **Repository:** https://github.com/NeuTr0n244/alon

## 🎨 Convensão de Commits

- `Add:` - Nova funcionalidade
- `Fix:` - Correção de bug
- `Update:` - Melhoria/atualização
- `Style:` - Mudanças de estilo/CSS
- `Refactor:` - Refatoração de código
- `Docs:` - Documentação
- `Deploy:` - Deploy de versão

## ⚠️ Importante

- Todo push para `main` dispara deploy automático
- GitHub Actions roda build antes de deployar
- Se o build falhar, o deploy não acontece
- Sempre teste localmente antes: `npm run build`

---

**Happy coding! 🚀**
