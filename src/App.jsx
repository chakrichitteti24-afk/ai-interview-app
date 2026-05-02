import React, { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import SetupScreen from './components/SetupScreen';
import InterviewChat from './components/InterviewChat';
import ResultScreen from './components/ResultScreen';
import AuthScreen from './components/AuthScreen';
import Logo from './components/Logo';
import { useInterview } from './hooks/useInterview';
import { supabase } from './lib/supabase';

function App() {
  const [session, setSession] = useState(null);
  const [appState, setAppState] = useState('HOME'); // HOME, SETUP, CHAT, RESULT
  
  const { 
    messages, 
    isLoading, 
    isFinished, 
    questionCount, 
    error,
    startInterview, 
    sendMessage 
  } = useInterview();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Watch for interview finish to transition to RESULT screen
  React.useEffect(() => {
    if (isFinished) {
      setAppState('RESULT');
    }
  }, [isFinished]);

  const handleStartSetup = () => {
    setAppState('SETUP');
  };

  const handleSetupComplete = (role, experience) => {
    startInterview(role, experience);
    setAppState('CHAT');
  };

  const handleRestart = () => {
    setAppState('HOME');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-background text-white font-mono selection:bg-accent selection:text-background">
      <style>{`
        .user-info {
          display: none;
        }
        @media (min-width: 640px) {
          .user-info {
            display: block;
            text-align: right;
          }
        }
      `}</style>
      {/* Header / Navbar */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1f1f1f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 100,
      }}>
        <Logo size="small" />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="user-info">
            <div style={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}>
              {session.user.user_metadata?.full_name || session.user.email?.split('@')[0]}
            </div>
            <div style={{ color: '#6b7280', fontSize: '10px' }}>{session.user.email}</div>
          </div>

          
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#1a1a1a',
              color: '#9ca3af',
              border: '1px solid #2a2a2a',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#ef4444';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#2a2a2a';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ paddingTop: '70px' }}>
        {error && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-900/90 border border-red-500 text-red-100 px-6 py-3 rounded-lg z-50 shadow-lg">
            {error}
          </div>
        )}

        {appState === 'HOME' && (
          <HomeScreen onStart={handleStartSetup} />
        )}
        
        {appState === 'SETUP' && (
          <SetupScreen onComplete={handleSetupComplete} />
        )}
        
        {appState === 'CHAT' && (
          <InterviewChat 
            messages={messages} 
            isLoading={isLoading} 
            onSendMessage={sendMessage}
            questionCount={questionCount}
          />
        )}

        {appState === 'RESULT' && (
          <ResultScreen 
            messages={messages} 
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
}

export default App;

