'use client';

import { useState, useEffect } from 'react';
import { signIn, signUp, confirmSignUp, getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';

Amplify.configure(outputs);

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user is already signed in
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      await getCurrentUser();
      // User is already signed in, redirect to dashboard
      router.push('/dashboard');
    } catch {
      // User is not signed in, stay on auth page
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password,
      });

      if (isSignedIn) {
        router.push('/dashboard');
      } else if (nextStep) {
        // Handle other steps if needed
        console.log('Next step:', nextStep);
        router.push('/dashboard');
      }
    } catch (err: any) {
      // If user is already signed in, redirect to dashboard
      if (err.message?.includes('already') || err.message?.includes('signed')) {
        router.push('/dashboard');
      } else {
        setError(err.message || 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { userId, isSignUpComplete, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setNeedsConfirmation(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode,
      });

      if (isSignUpComplete) {
        // Sign in automatically after confirmation
        const { isSignedIn } = await signIn({
          username: email,
          password,
        });

        if (isSignedIn) {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to confirm sign up');
    } finally {
      setLoading(false);
    }
  };

  if (needsConfirmation) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 tech-pattern opacity-20"></div>
        <div className="scan-line"></div>
        
        <div className="relative z-10 w-full max-w-md mx-auto p-6">
          <div className="cyber-card p-8">
            <h2 className="text-2xl font-bold mb-6 text-center cyber-neon" style={{color: 'var(--cyber-cyan)'}}>
              CONFIRM YOUR ACCOUNT
            </h2>
            
            <form onSubmit={handleConfirmSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-mono mb-2" style={{color: 'var(--cyber-cyan)'}}>
                  Confirmation Code
                </label>
                <input
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className="w-full px-4 py-2 bg-black border cyber-border text-white font-mono focus:outline-none focus:border-cyan-400"
                  placeholder="Enter code from email"
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm font-mono">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-mono font-bold cyber-border cyber-hologram transition-all transform hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #00FFFF, #FF69B4)',
                  color: '#000000',
                }}
              >
                {loading ? 'CONFIRMING...' : 'CONFIRM ACCOUNT'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 tech-pattern opacity-20"></div>
      <div className="scan-line"></div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl opacity-20" style={{background: 'var(--cyber-gradient-1)'}}></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-20" style={{background: 'var(--cyber-gradient-2)'}}></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md mx-auto p-6">
        <div className="cyber-card p-8">
          <h1 className="text-3xl font-bold mb-2 text-center">
            <span className="cyber-chrome">RAVE</span><span style={{color: 'var(--cyber-hot-pink)'}}>PULSE</span>
          </h1>
          <p className="text-center mb-8 font-mono text-sm" style={{color: 'var(--cyber-cyan)'}}>
            {isSignUp ? '>> CREATE NEW PULSE LINK' : '>> ACCESS PULSE NETWORK'}
          </p>
          
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-mono mb-2" style={{color: 'var(--cyber-cyan)'}}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-black border cyber-border text-white font-mono focus:outline-none focus:border-cyan-400"
                placeholder="user@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-mono mb-2" style={{color: 'var(--cyber-cyan)'}}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black border cyber-border text-white font-mono focus:outline-none focus:border-cyan-400"
                placeholder="••••••••"
                required
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-mono mb-2" style={{color: 'var(--cyber-cyan)'}}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-black border cyber-border text-white font-mono focus:outline-none focus:border-cyan-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm font-mono">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-mono font-bold cyber-border cyber-hologram transition-all transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00FFFF, #FF69B4)',
                color: '#000000',
              }}
            >
              {loading ? 'PROCESSING...' : (isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-sm font-mono hover:underline"
              style={{color: 'var(--cyber-magenta)'}}
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t" style={{borderColor: 'var(--cyber-cyan)'}}>
            <p className="text-center text-sm font-mono mb-4" style={{color: 'var(--cyber-cyan)'}}>
              Or connect with
            </p>
            <button
              type="button"
              className="w-full py-3 font-mono font-bold cyber-border transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #1DB954, #191414)',
                color: '#FFFFFF',
              }}
              onClick={() => {
                // This would be implemented with proper Spotify OAuth
                alert('Spotify integration coming soon! For now, use email sign up.');
              }}
            >
              <span className="text-2xl">🎵</span>
              CONNECT SPOTIFY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}