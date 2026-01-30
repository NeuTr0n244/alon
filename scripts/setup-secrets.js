#!/usr/bin/env node

/**
 * Setup GitHub Secrets Helper
 * Este script ajuda a configurar os secrets do GitHub
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 SETUP DE GITHUB SECRETS - ALON TERMINAL\n');

// Ler .vercel/project.json se existir
const vercelPath = path.join(__dirname, '..', '.vercel', 'project.json');

let orgId = '';
let projectId = '';

if (fs.existsSync(vercelPath)) {
  const vercelData = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  orgId = vercelData.orgId || '';
  projectId = vercelData.projectId || '';

  console.log('✅ Projeto Vercel detectado!');
  console.log(`📋 Org ID: ${orgId}`);
  console.log(`📋 Project ID: ${projectId}\n`);
} else {
  console.log('⚠️  Pasta .vercel não encontrada.');
  console.log('Execute primeiro: vercel link\n');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 CONFIGURAR GITHUB SECRETS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('1. Acesse: https://github.com/NeuTr0n244/alon/settings/secrets/actions\n');

console.log('2. Clique em "New repository secret" e adicione:\n');

console.log('SECRET 1:');
console.log('  Name: VERCEL_TOKEN');
console.log('  Value: [obtenha em https://vercel.com/account/tokens]\n');

if (orgId) {
  console.log('SECRET 2:');
  console.log('  Name: VERCEL_ORG_ID');
  console.log(`  Value: ${orgId}\n`);
}

if (projectId) {
  console.log('SECRET 3:');
  console.log('  Name: VERCEL_PROJECT_ID');
  console.log(`  Value: ${projectId}\n`);
}

console.log('SECRET 4:');
console.log('  Name: ELEVENLABS_API_KEY');
console.log('  Value: [sua chave da ElevenLabs]\n');

console.log('SECRET 5:');
console.log('  Name: ELEVENLABS_VOICE_ID');
console.log('  Value: [seu voice ID da ElevenLabs]\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎯 PRÓXIMOS PASSOS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('1. Configure os 5 secrets acima no GitHub');
console.log('2. Configure variáveis de ambiente no Vercel:');
console.log('   https://vercel.com/dashboard → Settings → Environment Variables');
console.log('3. Teste o auto-deploy:');
console.log('   npm run commit "Test: Auto-deploy setup"\n');

console.log('4. Verifique o deploy:');
console.log('   GitHub Actions: https://github.com/NeuTr0n244/alon/actions');
console.log('   Vercel Dashboard: https://vercel.com/dashboard\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📚 Documentação completa: SETUP_DEPLOY.md\n');
