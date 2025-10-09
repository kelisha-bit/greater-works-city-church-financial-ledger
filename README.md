<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run your app locally

This contains everything you need to run the app locally.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm run dev`

Then open the printed localhost URL (default: http://localhost:3000).

## Firebase Authentication Setup

This app uses Firebase Authentication to secure user access. To enable authentication:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication → Email/Password sign-in method
3. Create a `.env.local` file in the root directory with your Firebase config:

```
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Restart the development server after adding environment variables

## Features

- 🔐 **User Authentication**: Secure login/signup with Firebase Authentication
- 🏦 **Transaction Management**: Add, edit, delete income and expense transactions
- 📊 **Financial Dashboard**: Real-time summary of income, expenses, and balance
- 🎯 **Budget Tracking**: Set monthly budgets and monitor spending by category
- 📈 **Category Charts**: Visual expense breakdowns with interactive charts
- 📁 **CSV Import/Export**: Bulk transaction import and report generation
- 💰 **Receipt Attachments**: Attach digital receipts to transactions
- 📊 **Financial Reports**: Monthly and category-based summary reports
- 🔍 **Advanced Filtering**: Search, date range, and category filtering
- 📱 **Responsive Design**: Mobile-friendly interface

## Tech Stack

- React 19 with TypeScript
- Tailwind CSS for styling
- Vite for build tooling
- Vitest for testing
- Recharts for data visualization
- Local Storage for data persistence
