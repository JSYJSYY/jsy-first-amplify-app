'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [matrixChars, setMatrixChars] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseAnimation(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Generate matrix characters for background - reduced for performance
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const matrixArray = Array.from({ length: 15 }, () => chars[Math.floor(Math.random() * chars.length)]);
    setMatrixChars(matrixArray);
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Matrix Background - Optimized */}
      <div className="absolute inset-0 opacity-10">
        {matrixChars.map((char, i) => (
          <div
            key={i}
            className="matrix-character absolute text-xs"
            style={{
              left: `${(i * 6.5) % 100}%`,
              animationDuration: `${3 + (i % 3)}s`,
              animationDelay: `${i * 0.1}s`
            }}
          >
            {char}
          </div>
        ))}
      </div>
      
      {/* Scan Line */}
      <div className="scan-line"></div>
      
      {/* Circuit Board Background */}
      <div className="absolute inset-0 tech-pattern opacity-30"></div>
      
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        {/* Cyberpunk Glow Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl opacity-30" style={{background: 'var(--cyber-gradient-1)'}}></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-30 animation-delay-2000" style={{background: 'var(--cyber-gradient-2)'}}></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-2xl opacity-20" style={{background: 'var(--cyber-cyan)'}}></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Logo/Title */}
          <div className="mb-12">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 cyber-neon" style={{color: 'var(--cyber-cyan)'}}>
              <span className="cyber-chrome">RAVE</span><span style={{color: 'var(--cyber-hot-pink)'}}>PULSE</span>
            </h1>
            <div className="cyber-border p-4 bg-black/50 backdrop-blur-sm">
              <p className="text-xl md:text-2xl font-mono" style={{color: 'var(--cyber-cyan)'}}>
                {'>> PULSE LINK ESTABLISHED'}
              </p>
              <p className="text-lg text-gray-300 font-mono mt-2">
                Real-time EDM event recommendations powered by AI
              </p>
            </div>
          </div>

          {/* Connect with Spotify button */}
          <Link 
            href="/auth"
            className={`inline-flex items-center gap-4 px-8 py-4 font-mono font-bold text-lg transition-all transform hover:scale-105 relative group cyber-hologram cyber-border ${
              pulseAnimation ? 'cyber-neon' : ''
            }`}
            style={{
              background: 'linear-gradient(135deg, #00FFFF, #FF69B4)',
              color: '#000000',
              textShadow: '0 0 2px rgba(255,255,255,0.5)',
              clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)'
            }}
          >
            <span className="relative z-10" style={{ fontWeight: 900 }}>INITIALIZE PULSE LINK</span>
          </Link>

          {/* Features */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="cyber-card p-6 text-center">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="font-bold mb-2 text-lg" style={{color: 'var(--cyber-hot-pink)'}}>AI Music Analysis</h3>
              <p className="text-sm text-gray-400">Analyzes your Spotify listening patterns to recommend perfect events</p>
            </div>
            <div className="cyber-card p-6 text-center">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="font-bold mb-2 text-lg" style={{color: 'var(--cyber-cyan)'}}>Real-time Events</h3>
              <p className="text-sm text-gray-400">Live EDM event data from EDMTrain API with enriched genres</p>
            </div>
            <div className="cyber-card p-6 text-center">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="font-bold mb-2 text-lg" style={{color: 'var(--cyber-neon-green)'}}>Smart Tracking</h3>
              <p className="text-sm text-gray-400">Track attendance and build your personal rave history</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center p-8 cyber-border bg-black/50 backdrop-blur-sm">
        <p className="font-mono" style={{color: 'var(--cyber-cyan)'}}>
          &copy; 2077 RavePulse Neural Networks. All rights reserved.
        </p>
        <p className="text-xs font-mono mt-2" style={{color: 'var(--cyber-magenta)'}}>
          Powered by AWS Amplify • Pulse Link Technology
        </p>
      </footer>
    </div>
  );
}