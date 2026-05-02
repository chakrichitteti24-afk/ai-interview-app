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
