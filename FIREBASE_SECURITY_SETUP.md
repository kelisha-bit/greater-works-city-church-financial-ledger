# Firebase Security Setup Guide

## Overview
This guide will help you set up secure Firebase Authentication, Firestore, and Storage for your church financial ledger application.

---

## 📋 Prerequisites

1. **Firebase Project**: Create a project at https://console.firebase.google.com/
2. **Firebase CLI** (optional but recommended): `npm install -g firebase-tools`

---

## 🔐 Step 1: Enable Authentication

### 1.1 Enable Email/Password Authentication

1. Go to **Firebase Console** → Your Project
2. Click **Authentication** in the left sidebar
3. Click **Get Started** (if first time)
4. Go to **Sign-in method** tab
5. Click **Email/Password**
6. Enable **Email/Password** (first toggle)
7. Click **Save**

### 1.2 Create Your First Admin User

**Option A: Via Firebase Console**
1. Go to **Authentication** → **Users** tab
2. Click **Add user**
3. Enter email and password
4. Click **Add user**
5. Copy the **User UID**

**Option B: Via App (Recommended)**
1. Start your app: `npm run dev`
2. Go to the login page
3. Click "Sign Up" or register
4. Use your admin email and password

### 1.3 Set User Role to Admin

1. Go to **Firestore Database** in Firebase Console
2. Navigate to: `users/{your-user-uid}`
3. Click **Add field**:
   - Field: `role`
   - Type: `string`
   - Value: `Admin`
4. Click **Add**

---

## 🗄️ Step 2: Set Up Firestore Database

### 2.1 Create Firestore Database

1. Go to **Firestore Database** in Firebase Console
2. Click **Create database**
3. Choose **Start in production mode** (we'll add rules next)
4. Select your preferred location
5. Click **Enable**

### 2.2 Deploy Firestore Security Rules

**Option A: Via Firebase Console**
1. Go to **Firestore Database** → **Rules** tab
2. Copy the contents from `firestore.rules` file
3. Paste into the editor
4. Click **Publish**

**Option B: Via Firebase CLI (Recommended)**
```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### 2.3 Create Firestore Indexes (Optional but Recommended)

Deploy the indexes from `firestore.indexes.json`:
```bash
firebase deploy --only firestore:indexes
```

---

## 📦 Step 3: Set Up Firebase Storage

### 3.1 Enable Firebase Storage

1. Go to **Storage** in Firebase Console
2. Click **Get started**
3. Choose **Start in production mode**
4. Select your preferred location
5. Click **Done**

### 3.2 Deploy Storage Security Rules

**Option A: Via Firebase Console**
1. Go to **Storage** → **Rules** tab
2. Copy the contents from `storage.rules` file
3. Paste into the editor
4. Click **Publish**

**Option B: Via Firebase CLI**
```bash
firebase deploy --only storage
```

---

## 🔧 Step 4: Configure Environment Variables

### 4.1 Get Firebase Config

1. Go to **Project Settings** (gear icon) in Firebase Console
2. Scroll to **Your apps** section
3. Click the **Web app** icon `</>` (or add one if none exists)
4. Copy the `firebaseConfig` object

### 4.2 Create .env.local File

Create a `.env.local` file in your project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# Church Information
VITE_CHURCH_NAME=Greater Works City Church
VITE_CHURCH_ADDRESS=123 Faith Street, Accra, Ghana
VITE_CHURCH_PHONE=+233 XX XXX XXXX
VITE_CHURCH_EMAIL=info@greaterworkschurch.org
VITE_CHURCH_WEBSITE=www.greaterworkschurch.org
VITE_CHURCH_TAX_ID=XX-XXXXXXX
VITE_CHURCH_PASTOR_NAME=Pastor John Smith
```

### 4.3 Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## 🛡️ Security Rules Explanation

### Firestore Rules

Our Firestore rules implement the following security:

#### User Profiles (`/users/{userId}`)
- ✅ **Create**: Only authenticated users can create their own profile
- ✅ **Read**: Users can only read their own profile
- ✅ **Update**: Users can only update their own profile
- ❌ **Delete**: Profile deletion is disabled

#### User Data (`/users/{userId}/{collection}/{document}`)
- ✅ **Read**: Users can read their own data
- ✅ **Create**: Users can create their own data
- ✅ **Update**: Users can update their own data
- ⚠️ **Delete**: Only Admin or Treasurer roles can delete

#### Key Features:
- **Role-based access**: Admin and Treasurer roles have elevated permissions
- **Data isolation**: Users can only access their own data
- **Audit trail**: Deletion requires elevated permissions

### Storage Rules

Our Storage rules implement:

#### General User Files (`/users/{userId}/**`)
- ✅ Users can only access files in their own folder
- ✅ File type validation for receipts and images
- ✅ File size limits (10MB for receipts, 2MB for profile images)

#### Receipts (`/users/{userId}/receipts/{fileName}`)
- ✅ Read: Owner only
- ✅ Write: Owner with Editor role, valid file type, size limit
- ✅ Delete: Owner with Editor role

#### Profile Pictures (`/users/{userId}/profile/{fileName}`)
- ✅ Read: Owner only
- ✅ Write: Owner, image files only, 2MB limit
- ✅ Delete: Owner only

---

## 👥 Step 5: User Roles

### Available Roles

1. **Admin**: Full access to all features
2. **Treasurer**: Financial management access
3. **Viewer**: Read-only access (default)

### Setting User Roles

**Via Firestore Console:**
1. Go to **Firestore Database**
2. Navigate to `users/{userId}`
3. Update the `role` field to one of: `Admin`, `Treasurer`, or `Viewer`

**Via Code (Admin only):**
```typescript
// In your admin panel or user management component
await updateDoc(doc(db, 'users', userId), {
  role: 'Admin' // or 'Treasurer', 'Viewer'
});
```

---

## 🧪 Step 6: Test Your Security

### 6.1 Test Authentication
```bash
# Try accessing without login - should redirect to login page
# Try logging in with your credentials - should succeed
# Try accessing another user's data - should fail
```

### 6.2 Test Firestore Rules
1. Open **Firestore Database** → **Rules** tab
2. Click **Rules Playground**
3. Test various scenarios:
   - Reading your own data ✅
   - Reading another user's data ❌
   - Creating data without auth ❌
   - Deleting data as Viewer ❌

### 6.3 Test Storage Rules
1. Try uploading a profile picture - should work ✅
2. Try uploading a file > 2MB - should fail ❌
3. Try uploading a non-image as profile - should fail ❌

---

## 🚀 Step 7: Deploy to Production

### 7.1 Build Your App
```bash
npm run build
```

### 7.2 Deploy Firebase Rules
```bash
firebase deploy --only firestore:rules,storage
```

### 7.3 Deploy to Hosting (Optional)
```bash
# Initialize Firebase Hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Keep `.env.local` in `.gitignore` (already configured)
- ✅ Use strong passwords for admin accounts
- ✅ Regularly review Firestore and Storage usage
- ✅ Enable Firebase App Check for production
- ✅ Set up billing alerts in Firebase Console
- ✅ Regularly backup your Firestore data
- ✅ Monitor authentication logs

### ❌ DON'T:
- ❌ Commit `.env.local` to Git
- ❌ Share your Firebase credentials publicly
- ❌ Use the same password for multiple accounts
- ❌ Give Admin role to untrusted users
- ❌ Disable security rules in production
- ❌ Store sensitive data without encryption

---

## 📊 Monitoring & Maintenance

### Firebase Console Monitoring

1. **Authentication Usage**
   - Go to **Authentication** → **Usage** tab
   - Monitor sign-ins and user growth

2. **Firestore Usage**
   - Go to **Firestore Database** → **Usage** tab
   - Monitor reads, writes, and storage

3. **Storage Usage**
   - Go to **Storage** → **Usage** tab
   - Monitor bandwidth and storage

### Set Up Alerts

1. Go to **Project Settings** → **Integrations**
2. Set up **Budget alerts** for cost monitoring
3. Enable **Firebase Crashlytics** for error tracking

---

## 🆘 Troubleshooting

### "Permission Denied" Errors

**Problem**: Users getting permission denied when accessing data

**Solutions**:
1. Check if user is authenticated
2. Verify user has correct role in Firestore
3. Check security rules are deployed
4. Verify user is accessing their own data (userId matches)

### "Missing Environment Variables" Error

**Problem**: App crashes with missing Firebase config

**Solutions**:
1. Ensure `.env.local` exists in project root
2. Verify all `VITE_FIREBASE_*` variables are set
3. Restart dev server after adding variables
4. Check for typos in variable names

### "Firebase Not Initialized" Error

**Problem**: Firebase operations fail

**Solutions**:
1. Check Firebase config in `.env.local`
2. Verify Firebase project exists in console
3. Check internet connection
4. Verify API key is correct

### Storage Upload Fails

**Problem**: File uploads fail silently

**Solutions**:
1. Check file size (max 10MB for receipts, 2MB for images)
2. Verify file type is allowed
3. Check Storage rules are deployed
4. Verify user has Editor role (for receipts)

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

## 🎯 Quick Reference

### Common Firebase CLI Commands

```bash
# Login
firebase login

# Initialize project
firebase init

# Deploy all
firebase deploy

# Deploy specific services
firebase deploy --only firestore:rules
firebase deploy --only storage
firebase deploy --only hosting

# View logs
firebase functions:log

# Open Firebase Console
firebase open
```

### Environment Variables Quick Check

```bash
# Check if variables are loaded (in your app)
console.log('Firebase Config:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
});
```

---

## ✅ Security Checklist

Before going to production, ensure:

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Admin user created and role set
- [ ] Firestore database created
- [ ] Firestore security rules deployed
- [ ] Storage enabled
- [ ] Storage security rules deployed
- [ ] `.env.local` configured with all variables
- [ ] `.env.local` in `.gitignore`
- [ ] Security rules tested
- [ ] Billing alerts configured
- [ ] Backup strategy in place
- [ ] Team members have appropriate roles

---

**Need Help?** Check the troubleshooting section or refer to Firebase documentation.
