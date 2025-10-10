import React from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  React.useEffect(() => {
    // Auto-hide splash screen after animation completes
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 3000); // 3 seconds for the full animation

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-white/5 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/5 rounded-full blur-lg animate-bounce" style={{ animationDuration: '3s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-md animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Main Content */}
      <div className="relative z-10 text-center text-white max-w-md mx-auto px-6">
        {/* Logo/Icon */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">GW</span>
            </div>
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          Greater Works
        </h1>
        <h2 className="text-xl md:text-2xl font-light mb-6 text-blue-100">
          City Church
        </h2>

        {/* Subtitle */}
        <p className="text-lg text-blue-100 mb-8 font-medium">
          Financial Ledger
        </p>

        {/* Loading Animation */}
        <div className="relative">
          <div className="w-12 h-12 mx-auto">
            <div className="absolute inset-0 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-sm text-blue-200 mt-4 animate-pulse">
            Loading your financial dashboard...
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
      </div>

      {/* Bottom Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
    </div>
  );
};

export default SplashScreen;
