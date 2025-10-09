# 🚀 Deployment Guide - Greater Works City Church Financial Ledger

## Prerequisites
- Node.js (v16 or higher)
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with Authentication and Firestore enabled

## Environment Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Firebase Configuration**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password provider)
   - Enable Firestore Database
   - Enable Storage (for receipt attachments)

3. **Environment Variables**
   Create `.env.local` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

## Security Rules Setup

### 1. Deploy Firestore Security Rules
The app includes comprehensive security rules in `firestore.rules`. Deploy them:

```bash
firebase deploy --only firestore:rules
```

**Key Security Features:**
- **Role-based Access Control**: Admin, Editor, Viewer roles
- **Data Validation**: Server-side validation for all operations
- **Ownership Verification**: Users can only access their own data
- **Granular Permissions**: Different permissions for read/write operations

### 2. Deploy Storage Security Rules
Deploy storage rules for file uploads:

```bash
firebase deploy --only storage
```

**Storage Security Features:**
- **File Type Validation**: Only images and documents allowed
- **Size Limits**: 10MB for receipts, 2MB for profile images
- **Role-based Uploads**: Editor+ permissions required for receipts

## Development

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Run Tests**
   ```bash
   npm run test
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Production Deployment

### Option 1: Firebase Hosting (Recommended)
```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy everything (hosting, functions, rules)
firebase deploy
```

### Option 2: Netlify
```bash
# Build the app
npm run build

# Deploy the dist folder to Netlify
```

## User Roles & Permissions

| Role | Transactions | Members | Budgets | Categories | Users |
|------|-------------|---------|---------|------------|-------|
| **Admin** | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Manage Roles |
| **Editor** | ✅ Read/Write | ✅ Read/Write | ✅ Read/Write | ✅ Read/Write | ❌ No Access |
| **Viewer** | ✅ Read Only | ✅ Read Only | ✅ Read Only | ✅ Read Only | ❌ No Access |

## Data Structure

```
/users/{userId}/
├── transactions/          # Financial transactions
├── members/              # Church members
├── budgets/              # Monthly budgets
└── categories/           # Expense categories

/users/{userId}/receipts/  # Receipt attachments
/users/{userId}/profile/   # Profile pictures
```

## Security Best Practices

1. **Authentication Required**: All operations require valid Firebase Auth
2. **Data Validation**: Server-side validation prevents malicious data
3. **Role Enforcement**: Permissions enforced at database level
4. **File Security**: Type and size validation for all uploads
5. **Audit Trail**: All changes logged for compliance

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Ensure security rules are deployed
   - Check user role assignments
   - Verify authentication state

2. **File Upload Failures**
   - Check file type and size limits
   - Verify storage rules deployment
   - Ensure user has editor permissions

3. **Role Changes Not Working**
   - Check Firestore rules allow role updates for admins
   - Verify user document structure

### Support
For issues, check:
- Firebase Console logs
- Browser developer tools
- Network tab for failed requests

## Performance Optimization

- **Pagination**: Configurable page sizes (10-100 items)
- **Caching**: Local storage for offline support
- **Lazy Loading**: Components load on demand
- **Optimized Queries**: Efficient Firestore queries

## Compliance

This application includes features for financial compliance:
- **Receipt Management**: Digital receipt attachments
- **Donation Tracking**: Detailed donor information
- **Audit Trail**: Complete transaction history
- **Access Controls**: Role-based data protection

---

**Ready for Production!** 🎉 The app includes enterprise-grade security, comprehensive validation, and excellent user experience.
