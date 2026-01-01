import React, { useEffect, useState } from 'react';

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [shouldShow] = useState(() => !sessionStorage.getItem('saqlain_splash_shown'));
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("INITIALIZING...");

  useEffect(() => {
    if (!shouldShow) {
      onComplete();
      return;
    }

    sessionStorage.setItem('saqlain_splash_shown', 'true');

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 25) + 5;
      });
    }, 80);

    const textTimers = [
        setTimeout(() => setLoadingText("LINKING..."), 600),
        setTimeout(() => setLoadingText("READY."), 1200)
    ];

    const finishTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }, 1500);

    return () => {
        clearInterval(interval);
        textTimers.forEach(clearTimeout);
        clearTimeout(finishTimer);
    };
  }, [shouldShow, onComplete]);

  if (!shouldShow) return null;
  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[1000] bg-[#0a0a0a] flex items-center justify-center flex-col overflow-hidden font-mono ${!isVisible ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
      <div className="scanline"></div>
      
      <div className="relative z-30 flex flex-col items-center">
          <div 
            className="glitch-active text-5xl md:text-8xl font-black text-white tracking-tighter mb-12 relative"
            data-text="SAQLAIN AI"
          >
            SAQLAIN AI
          </div>

          <div className="w-48 h-1 bg-[#1e1e1e] rounded-full mb-6 relative overflow-hidden">
             <div 
                className="absolute top-0 left-0 h-full bg-accent shadow-[0_0_15px_#4d7cff] transition-all duration-200 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
             ></div>
          </div>

          <div className="text-accent text-[10px] tracking-[0.4em] font-bold uppercase">
             {loadingText}
          </div>
      </div>
    </div>
  );
};

export default SplashScreen;