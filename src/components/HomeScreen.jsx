import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import { supabase } from '../lib/supabase';

const HomeScreen = ({ onStart, session }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchHistory();
    }
  }, [session]);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('interview_sessions')
      .select('id, role, level, score, date')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false })
      .limit(5);
    
    if (!error && data) {
      setHistory(data);
    }
  };
  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#080d1f',
      padding: '24px 16px',
      fontFamily: '"Outfit", sans-serif',
    }}>

      {/* Glow blob */}
      <div style={{
        position: 'fixed',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        height: '300px',
        background: 'radial-gradient(ellipse, rgba(0,255,136,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
      }}>

        {/* Logo at Top Center */}
        <div style={{ transform: 'scale(1.2)' }}>
          <Logo />
        </div>

        {/* Hero text */}
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <p style={{
            color: '#9ca3af',
            fontSize: 'clamp(0.9rem, 3vw, 1.05rem)',
            margin: 0,
            lineHeight: 1.6,
          }}>
            Practice with <span style={{ color: '#00ff88' }}>Smith</span>, your AI interviewer.<br />
            Get real feedback. Land the job.
          </p>
        </div>


        {/* Feature pills */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center',
        }}>
          {['🎙️ Voice Input', '🔊 AI Speaks', '📊 10 Questions', '⚡ Instant Feedback'].map(f => (
            <span key={f} style={{
              padding: '5px 14px',
              borderRadius: '999px',
              background: '#111',
              border: '1px solid #2a2a2a',
              color: '#6b7280',
              fontSize: '12px',
            }}>{f}</span>
          ))}
        </div>

        {/* CTA Button */}
        <button
          id="start-interview-btn"
          onClick={onStart}
          style={{
            width: '100%',
            padding: '18px 32px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
            color: '#0a0a0a',
            fontFamily: 'inherit',
            fontWeight: '800',
            fontSize: '1.05rem',
            letterSpacing: '0.04em',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 30px rgba(0,255,136,0.35), 0 4px 24px rgba(0,0,0,0.4)',
            transition: 'all 0.2s ease',
            textTransform: 'uppercase',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 0 45px rgba(0,255,136,0.5), 0 8px 32px rgba(0,0,0,0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(0,255,136,0.35), 0 4px 24px rgba(0,0,0,0.4)';
          }}
        >
          Start Interview →
        </button>

        {/* Interview History */}
        {history.length > 0 && (
          <div style={{
            width: '100%',
            maxWidth: '400px',
            marginTop: '40px',
          }}>
            <h3 style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              margin: '0 0 16px',
              textAlign: 'center',
            }}>
              Recent Sessions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {history.map((session) => (
                <div
                  key={session.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>
                      {session.role}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                      {new Date(session.date).toLocaleDateString()} · {session.level}
                    </span>
                  </div>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: session.score >= 8 ? 'rgba(0,255,136,0.2)' : session.score >= 6 ? 'rgba(0,204,255,0.2)' : 'rgba(255,77,77,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: session.score >= 8 ? '#00ff88' : session.score >= 6 ? '#00ccff' : '#ff4d4d',
                  }}>
                    {session.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: '40px 0 0', textAlign: 'center' }}>
          Powered by <span style={{ color: 'rgba(255,255,255,0.5)' }}>Smith · Groq AI</span>
        </p>
      </div>
      
      <style>{`
        @media (max-width: 375px) {
          div > div {
            gap: 24px !important;
          }
          div > div > div:first-child {
            transform: scale(0.9) !important;
          }
          div > div > p {
            font-size: 0.85rem !important;
          }
          div > div > div:nth-child(3) {
            gap: 6px !important;
          }
          div > div > div:nth-child(3) span {
            font-size: 10px !important;
            padding: 4px 10px !important;
          }
          div > div > button {
            padding: 14px 24px !important;
            font-size: 0.9rem !important;
          }
          div > div > div:last-of-type {
            margin-top: 24px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomeScreen;
