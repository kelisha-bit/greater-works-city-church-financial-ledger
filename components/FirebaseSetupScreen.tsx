import React from 'react';

const FirebaseSetupScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Firebase Setup Required</h1>
          <p className="text-gray-600">Your app needs Firebase configuration to run</p>
        </div>

        {/* Alert Box */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 font-medium">
                Missing Firebase environment variables. The app cannot connect to the database.
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Get Your Firebase Credentials
            </h2>
            <div className="ml-10 space-y-2 text-gray-700">
              <p>• Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Firebase Console</a></p>
              <p>• Select your project (or create a new one)</p>
              <p>• Click the ⚙️ gear icon → <strong>Project Settings</strong></p>
              <p>• Scroll to "Your apps" → Click web icon <code className="bg-gray-100 px-2 py-1 rounded">&lt;/&gt;</code></p>
              <p>• Copy the <code className="bg-gray-100 px-2 py-1 rounded">firebaseConfig</code> values</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Create .env.local File
            </h2>
            <div className="ml-10">
              <p className="text-gray-700 mb-3">Create a file named <code className="bg-gray-100 px-2 py-1 rounded font-mono">.env.local</code> in your project root with:</p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-xs font-mono">
{`VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Optional: Church Information
VITE_CHURCH_NAME=Greater Works City Church
VITE_CHURCH_ADDRESS=123 Faith Street, Accra, Ghana
VITE_CHURCH_PHONE=+233 XX XXX XXXX
VITE_CHURCH_EMAIL=info@greaterworkschurch.org`}
                </pre>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Restart Your Dev Server
            </h2>
            <div className="ml-10">
              <p className="text-gray-700 mb-3">After saving .env.local, restart the development server:</p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                <pre className="text-sm font-mono">
{`# Stop the current server (Ctrl+C)
# Then restart:
npm run dev`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Help Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">📚 Need More Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <a href="/QUICK_START.md" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <p className="font-medium text-blue-700 text-sm">Quick Start Guide</p>
              <p className="text-xs text-blue-600">5-minute setup</p>
            </a>
            <a href="/FIREBASE_SECURITY_SETUP.md" className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <p className="font-medium text-green-700 text-sm">Full Setup Guide</p>
              <p className="text-xs text-green-600">Complete instructions</p>
            </a>
            <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <p className="font-medium text-purple-700 text-sm">Firebase Console</p>
              <p className="text-xs text-purple-600">Get credentials</p>
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            💡 <strong>Tip:</strong> You can also run <code className="bg-gray-200 px-2 py-1 rounded">npm run check:firebase</code> to verify your configuration
          </p>
        </div>
      </div>
    </div>
  );
};

export default FirebaseSetupScreen;
