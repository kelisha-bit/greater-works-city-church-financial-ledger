# 🚀 Quick Start Guide

## Get Your App Running in 5 Minutes!

### Step 1: Configure Firebase (2 minutes)

1. **Open your `.env.local` file** (currently open in your editor)

2. **Get your Firebase credentials:**
   - Go to: https://console.firebase.google.com/
   - Select your project (or create one)
   - Click the ⚙️ gear icon → **Project settings**
   - Scroll to "Your apps" → Click web app icon `</>`
   - Copy the config values

3. **Paste into `.env.local`:**
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abc...
   ```

4. **Update church info** (optional):
   ```env
   VITE_CHURCH_NAME=Your Church Name
   VITE_CHURCH_ADDRESS=Your Address
   VITE_CHURCH_PHONE=Your Phone
   VITE_CHURCH_EMAIL=your@email.com
   ```

### Step 2: Verify Configuration (30 seconds)

Run the configuration checker:
```bash
npm run check:firebase
```

✅ If all checks pass, continue to Step 3
❌ If errors appear, fix the missing variables

### Step 3: Enable Firebase Services (2 minutes)

#### Enable Authentication:
1. Firebase Console → **Authentication**
2. Click **Get Started**
3. Enable **Email/Password**

#### Enable Firestore:
1. Firebase Console → **Firestore Database**
2. Click **Create database**
3. Choose **Production mode**
4. Select location → **Enable**

#### Enable Storage (for receipts/images):
1. Firebase Console → **Storage**
2. Click **Get started**
3. Choose **Production mode**
4. Click **Done**

### Step 4: Deploy Security Rules (1 minute)

**Option A: Via Console (Easiest)**

For Firestore:
1. Firestore → **Rules** tab
2. Copy content from `firestore.rules`
3. Paste and **Publish**

For Storage:
1. Storage → **Rules** tab
2. Copy content from `storage.rules`
3. Paste and **Publish**

**Option B: Via CLI**
```bash
firebase login
firebase deploy --only firestore:rules,storage
```

### Step 5: Start Your App! (10 seconds)

```bash
npm run dev
```

🎉 **Your app should now be running!**

Open: http://localhost:5173

---

## 🆘 Troubleshooting

### Error: "Missing Firebase environment variables"
- ✅ Check `.env.local` exists in project root
- ✅ Verify all `VITE_FIREBASE_*` variables are set
- ✅ Restart dev server after changes

### Error: "Permission denied"
- ✅ Deploy Firestore security rules (Step 4)
- ✅ Enable Authentication (Step 3)
- ✅ Create a user account in the app

### Error: "Firebase not initialized"
- ✅ Check Firebase config values are correct
- ✅ Verify project exists in Firebase Console
- ✅ Check internet connection

---

## 📚 Next Steps

1. **Create your admin account:**
   - Register in the app
   - Go to Firestore Console
   - Set `role: "Admin"` in your user document

2. **Read the full guides:**
   - 📖 `FIREBASE_SECURITY_SETUP.md` - Complete security guide
   - 📖 `RECEIPT_FEATURES.md` - Receipt system documentation
   - 📖 `README.md` - Full application documentation

3. **Customize your church info:**
   - Update all `VITE_CHURCH_*` variables in `.env.local`
   - Add your church logo to `/public/GWCC-logo.png`

---

## ✅ Quick Checklist

- [ ] `.env.local` created with Firebase config
- [ ] Firebase Authentication enabled
- [ ] Firestore Database created
- [ ] Firebase Storage enabled
- [ ] Security rules deployed
- [ ] Dev server running
- [ ] Admin account created
- [ ] Admin role assigned

---

**Need more help?** See `FIREBASE_SECURITY_SETUP.md` for detailed instructions!
