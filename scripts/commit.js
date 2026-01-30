#!/usr/bin/env node

/**
 * Quick Commit Script
 * Usage: npm run commit "Your message" or node scripts/commit.js "Your message"
 */

const { execSync } = require('child_process');

const args = process.argv.slice(2);
const message = args.join(' ') || `Update: ${new Date().toISOString().split('T')[0]} ${new Date().toTimeString().split(' ')[0]}`;

try {
  console.log('📦 Adding all changes...');
  execSync('git add .', { stdio: 'inherit' });

  console.log(`💬 Committing with message: "${message}"`);
  execSync(`git commit -m "${message}"`, { stdio: 'inherit' });

  console.log('🚀 Pushing to remote...');
  execSync('git push', { stdio: 'inherit' });

  console.log('\n✅ Done! Changes committed and pushed.');
  console.log('🔄 Vercel will auto-deploy on GitHub push.');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
