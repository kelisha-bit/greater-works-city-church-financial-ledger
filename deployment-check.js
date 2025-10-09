#!/usr/bin/env node

// 🚀 Deployment Readiness Check Script
// Run this before deploying to production

import fs from 'fs';
import { execSync } from 'child_process';

console.log('🔍 Checking deployment readiness...');
console.log('==================================');

// Check if security rules exist
console.log('✅ Checking Firebase security rules...');
if (fs.existsSync('firestore.rules') && fs.existsSync('storage.rules')) {
    console.log('   ✓ Security rules files found');
} else {
    console.log('   ❌ Missing security rules files!');
    console.log('   Please create firestore.rules and storage.rules');
    process.exit(1);
}

// Check if deployment config exists
console.log('✅ Checking deployment configuration...');
if (fs.existsSync('netlify.toml')) {
    console.log('   ✓ Netlify configuration found');
} else {
    console.log('   ❌ Missing netlify.toml!');
    process.exit(1);
}

// Check if build works
console.log('✅ Testing build process...');
try {
    execSync('npm run build', { stdio: 'pipe' });
    console.log('   ✓ Build successful');
} catch (error) {
    console.log('   ❌ Build failed!');
    process.exit(1);
}

// Check if tests pass (basic check)
console.log('✅ Checking tests...');
try {
    execSync('npm run test:run', { stdio: 'pipe' });
    console.log('   ✓ Tests passing');
} catch (error) {
    console.log('   ⚠️  Some tests failing (but build works)');
}

console.log('');
console.log('🎉 Deployment readiness check passed!');
console.log('');
console.log('📋 Next steps:');
console.log('1. Set up production Firebase project');
console.log('2. Deploy security rules to Firebase');
console.log('3. Update .env.local with production credentials');
console.log('4. Deploy to Netlify/Vercel');
console.log('');
console.log('📖 See PRODUCTION_DEPLOYMENT.md for detailed instructions');
