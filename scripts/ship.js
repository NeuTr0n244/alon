#!/usr/bin/env node

/**
 * Ship Script - Build, Commit, Push, Deploy
 * Usage: npm run ship "Your message"
 */

const { execSync } = require('child_process');

const args = process.argv.slice(2);
const message = args.join(' ') || `Deploy: ${new Date().toISOString().split('T')[0]} ${new Date().toTimeString().split(' ')[0]}`;

try {
  console.log('🏗️  Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('\n📦 Adding all changes...');
  execSync('git add .', { stdio: 'inherit' });

  console.log(`💬 Committing with message: "${message}"`);
  execSync(`git commit -m "${message}"`, { stdio: 'inherit' });

  console.log('🚀 Pushing to GitHub...');
  execSync('git push', { stdio: 'inherit' });

  console.log('\n✅ Done! GitHub Actions will auto-deploy to Vercel.');
  console.log('🌐 Check deployment status: https://github.com/NeuTr0n244/alon/actions');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
