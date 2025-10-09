# 🚀 Production Deployment Guide

## ⚠️ Critical Security Setup Required

**STOP!** Do not deploy until you complete the Firebase security setup below.

## 1. Firebase Production Setup

### Step 1: Create Production Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" (or use existing project)
3. Enter project name: `greater-works-church-ledger-prod`
4. Follow the setup wizard

### Step 2: Enable Authentication
1. In Firebase Console → **Authentication** → **Get started**
2. Enable **Email/Password** sign-in method
3. Go to **Authorized domains** tab
4. Add your production domain (e.g., `your-app.netlify.app`)

### Step 3: Enable Firestore Database
1. In Firebase Console → **Firestore Database** → **Create database**
2. Choose **Production mode** (not test mode!)
3. Select region close to your users
4. **Important**: Start in **Production mode** for security

### Step 4: Deploy Security Rules

#### Firestore Rules
1. In Firebase Console → **Firestore Database** → **Rules**
2. Replace existing rules with content from `firestore.rules` file
3. Click **Publish**

#### Storage Rules (if using file uploads)
1. In Firebase Console → **Storage** → **Rules**
2. Replace existing rules with content from `storage.rules` file
3. Click **Publish**

### Step 5: Get Production Configuration
1. In Firebase Console → **Project settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **Add app** → **Web app** icon
4. Register your app with production domain
5. Copy the `firebaseConfig` object

## 2. Environment Configuration

### Update .env.local for Production
```bash
# Replace YOUR_PROJECT_VALUES with actual Firebase config
VITE_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxxx
```

## 3. Deployment Platforms

### Option A: Netlify (Recommended)

#### Step 1: Connect Repository
1. Push your code to GitHub/GitLab
2. Go to [Netlify](https://netlify.com)
3. Click **Add new site** → **Import an existing project**
4. Connect your Git repository

#### Step 2: Configure Build Settings
- **Base directory**: `.` (root)
- **Build command**: `npm run build`
- **Publish directory**: `dist`

#### Step 3: Set Environment Variables
In Netlify Dashboard → **Site settings** → **Environment variables**:
```
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Step 4: Deploy
- Netlify will automatically build and deploy
- Your site will be available at `https://random-name.netlify.app`

### Option B: Vercel

#### Step 1: Connect Repository
1. Push code to GitHub/GitLab
2. Go to [Vercel](https://vercel.com)
3. Click **Add New** → **Project**
4. Import your repository

#### Step 2: Configure Project
- **Framework Preset**: Vite
- **Root Directory**: `.` (leave empty)

#### Step 3: Set Environment Variables
In Vercel Dashboard → **Settings** → **Environment Variables**:
```
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 4. Post-Deployment Verification

### Test Authentication
1. Visit your deployed site
2. Try signing up with a test email
3. Verify email verification works
4. Test sign-in/sign-out flow

### Test Data Security
1. Create two test accounts
2. Verify users cannot access each other's data
3. Test transaction creation and editing

### Test Core Features
- [ ] Transaction CRUD operations
- [ ] Budget tracking
- [ ] Report generation
- [ ] CSV import/export
- [ ] Receipt uploads (if implemented)

## 5. Production Monitoring

### Firebase Console Monitoring
1. **Authentication**: Monitor user signups and security events
2. **Firestore**: Monitor usage and costs
3. **Storage**: Monitor file uploads and storage costs
4. **Error Reporting**: Enable Firebase Error Reporting

### Performance Monitoring
- Enable Firebase Performance Monitoring
- Monitor Core Web Vitals
- Set up uptime monitoring (e.g., Pingdom, UptimeRobot)

## 6. Security Checklist

- [ ] Firebase Security Rules deployed and tested
- [ ] Environment variables properly configured
- [ ] HTTPS enabled (automatic on most platforms)
- [ ] Authorized domains configured in Firebase Auth
- [ ] Production Firebase project created (separate from development)

## 7. Troubleshooting

### Common Issues

**Authentication Not Working**
- Check if authorized domains are set in Firebase Auth
- Verify environment variables are correctly set
- Check browser console for Firebase errors

**Firestore Access Denied**
- Verify security rules are published
- Check if user is properly authenticated
- Ensure user ID matches document path

**Build Failures**
- Check if all dependencies are installed: `npm install`
- Verify Node.js version compatibility
- Check for TypeScript errors: `npm run build`

## 8. Support

If you encounter issues:
1. Check Firebase Console for errors
2. Review browser developer tools
3. Verify environment variables are set correctly
4. Test with Firebase Emulator if needed

---

**🚨 REMINDER**: Never commit `.env.local` or real Firebase credentials to version control!
