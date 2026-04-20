import React from 'react';

const HomeScreen = ({ onStart }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      padding: '24px 16px',
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
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

        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '999px',
          border: '1px solid rgba(0,255,136,0.3)',
          background: 'rgba(0,255,136,0.06)',
          color: '#00ff88',
          fontSize: '11px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', display: 'inline-block', boxShadow: '0 0 6px #00ff88' }} />
          AI-Powered Mock Interviews
        </div>

        {/* Hero text */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 10vw, 5rem)',
            fontWeight: '800',
            margin: '0 0 12px',
            background: 'linear-gradient(135deg, #ffffff 0%, #00ff88 60%, #00cc6a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}>
            PrepIQ
          </h1>
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

        {/* Footer */}
        <p style={{ color: '#374151', fontSize: '11px', margin: 0, textAlign: 'center' }}>
          Powered by <span style={{ color: '#4b5563' }}>Smith · Groq AI · llama-3.3-70b</span>
        </p>
      </div>
    </div>
  );
};

export default HomeScreen;
