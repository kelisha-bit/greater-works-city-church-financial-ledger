#!/usr/bin/env node

/**
 * Firebase Configuration Checker
 * Verifies that all required Firebase environment variables are set
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const optionalVars = [
  'VITE_CHURCH_NAME',
  'VITE_CHURCH_ADDRESS',
  'VITE_CHURCH_PHONE',
  'VITE_CHURCH_EMAIL',
  'VITE_CHURCH_WEBSITE',
  'VITE_CHURCH_TAX_ID',
  'VITE_CHURCH_PASTOR_NAME',
];

console.log('\n🔍 Firebase Configuration Checker\n');
console.log('=' .repeat(50));

// Check if .env.local exists
const envPath = join(__dirname, '.env.local');
if (!existsSync(envPath)) {
  console.log('\n❌ ERROR: .env.local file not found!');
  console.log('\n📝 To fix this:');
  console.log('   1. Copy .env.example to .env.local');
  console.log('   2. Fill in your Firebase credentials');
  console.log('   3. Run this script again\n');
  process.exit(1);
}

// Read .env.local
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// Check required variables
console.log('\n🔐 Required Firebase Variables:\n');
let missingRequired = [];
let placeholderRequired = [];

requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (!value) {
    console.log(`   ❌ ${varName}: Missing`);
    missingRequired.push(varName);
  } else if (value.includes('your_') || value.includes('your-')) {
    console.log(`   ⚠️  ${varName}: Placeholder value detected`);
    placeholderRequired.push(varName);
  } else {
    console.log(`   ✅ ${varName}: Set`);
  }
});

// Check optional variables
console.log('\n⛪ Optional Church Information:\n');
let missingOptional = [];

optionalVars.forEach(varName => {
  const value = envVars[varName];
  if (!value) {
    console.log(`   ⚠️  ${varName}: Not set (using default)`);
    missingOptional.push(varName);
  } else {
    console.log(`   ✅ ${varName}: Set`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Summary:\n');

if (missingRequired.length === 0 && placeholderRequired.length === 0) {
  console.log('   ✅ All required Firebase variables are properly configured!');
} else {
  if (missingRequired.length > 0) {
    console.log(`   ❌ ${missingRequired.length} required variable(s) missing`);
  }
  if (placeholderRequired.length > 0) {
    console.log(`   ⚠️  ${placeholderRequired.length} variable(s) have placeholder values`);
  }
}

if (missingOptional.length > 0) {
  console.log(`   ℹ️  ${missingOptional.length} optional variable(s) not set (will use defaults)`);
}

// Instructions
if (missingRequired.length > 0 || placeholderRequired.length > 0) {
  console.log('\n📝 Next Steps:\n');
  console.log('   1. Go to https://console.firebase.google.com/');
  console.log('   2. Select your project');
  console.log('   3. Go to Project Settings (gear icon)');
  console.log('   4. Scroll to "Your apps" and select your web app');
  console.log('   5. Copy the config values to .env.local');
  console.log('   6. Restart your dev server: npm run dev\n');
  console.log('   📖 For detailed instructions, see: FIREBASE_SECURITY_SETUP.md\n');
  process.exit(1);
} else {
  console.log('\n✅ Configuration looks good!');
  console.log('\n🚀 You can now start your app: npm run dev\n');
  process.exit(0);
}
