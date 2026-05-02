import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

const AuthScreen = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Check your email for confirmation link!' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      padding: '24px 16px',
      fontFamily: '"JetBrains Mono", monospace',
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'fixed',
        top: '30%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(0,255,136,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        background: '#111',
        padding: '40px 32px',
        borderRadius: '24px',
        border: '1px solid #1f1f1f',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Logo />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 8px' }}>
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            {isSignUp ? 'Start your interview prep today' : 'Log in to continue your journey'}
          </p>
        </div>

        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 255, 136, 0.1)',
            color: message.type === 'error' ? '#ef4444' : '#00ff88',
            border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 255, 136, 0.2)'}`,
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '600' }}>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              style={{
                background: '#0a0a0a',
                border: '1px solid #2a2a2a',
                borderRadius: '12px',
                padding: '14px 16px',
                color: '#fff',
                outline: 'none',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '600' }}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                background: '#0a0a0a',
                border: '1px solid #2a2a2a',
                borderRadius: '12px',
                padding: '14px 16px',
                color: '#fff',
                outline: 'none',
                fontSize: '14px',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
              color: '#0a0a0a',
              fontWeight: '800',
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: 1, height: '1px', background: '#1f1f1f' }} />
          <span style={{ color: '#4b5563', fontSize: '12px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#1f1f1f' }} />
        </div>

        <button
          onClick={handleGoogleLogin}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '14px',
            borderRadius: '12px',
            background: 'transparent',
            color: '#fff',
            border: '1px solid #2a2a2a',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px', margin: 0 }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"} {' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: 'none',
              border: 'none',
              color: '#00ff88',
              fontWeight: '700',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
