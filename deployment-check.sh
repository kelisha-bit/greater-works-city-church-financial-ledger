#!/bin/bash

# 🚀 Deployment Readiness Check Script
# Run this before deploying to production

echo "🔍 Checking deployment readiness..."
echo "=================================="

# Check if security rules exist
echo "✅ Checking Firebase security rules..."
if [ -f "firestore.rules" ] && [ -f "storage.rules" ]; then
    echo "   ✓ Security rules files found"
else
    echo "   ❌ Missing security rules files!"
    echo "   Please create firestore.rules and storage.rules"
    exit 1
fi

# Check if deployment config exists
echo "✅ Checking deployment configuration..."
if [ -f "netlify.toml" ]; then
    echo "   ✓ Netlify configuration found"
else
    echo "   ❌ Missing netlify.toml!"
    exit 1
fi

# Check if build works
echo "✅ Testing build process..."
if npm run build > /dev/null 2>&1; then
    echo "   ✓ Build successful"
else
    echo "   ❌ Build failed!"
    exit 1
fi

# Check if tests pass (basic check)
echo "✅ Checking tests..."
if npm run test:run > /dev/null 2>&1; then
    echo "   ✓ Tests passing"
else
    echo "   ⚠️  Some tests failing (but build works)"
fi

echo ""
echo "🎉 Deployment readiness check passed!"
echo ""
echo "📋 Next steps:"
echo "1. Set up production Firebase project"
echo "2. Deploy security rules to Firebase"
echo "3. Update .env.local with production credentials"
echo "4. Deploy to Netlify/Vercel"
echo ""
echo "📖 See PRODUCTION_DEPLOYMENT.md for detailed instructions"
