import React from 'react';

const ResultScreen = ({ messages, onRestart }) => {
  // The final message from Smith contains the summary
  const summaryMessage = [...messages].reverse().find(m => m.role === 'assistant');
  const summaryContent = summaryMessage ? summaryMessage.content : 'No summary available.';

  // Try to extract a score from the summary text (e.g. "7/10" or "7 out of 10")
  const scoreMatch = summaryContent.match(/(\d{1,2})\s*(?:\/|out of)\s*10/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

  const scoreColor = score === null ? '#9ca3af'
    : score >= 8 ? '#00ff88'
    : score >= 5 ? '#f59e0b'
    : '#ef4444';

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      padding: '24px 16px',
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    }}>

      {/* Glow */}
      <div style={{
        position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: '400px', height: '300px',
        background: `radial-gradient(ellipse, ${scoreColor}12 0%, transparent 70%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '600px',
        display: 'flex', flexDirection: 'column', gap: '24px',
      }}>

        {/* Score card */}
        <div style={{
          background: '#111',
          border: '1px solid #1f1f1f',
          borderRadius: '20px',
          padding: '36px 28px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: `${scoreColor}15`,
            border: `2px solid ${scoreColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '2rem',
            boxShadow: `0 0 24px ${scoreColor}30`,
          }}>
            {score !== null ? '🏆' : '📋'}
          </div>

          <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: '700', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
            Interview Complete!
          </h2>

          {score !== null && (
            <div style={{ margin: '16px 0' }}>
              <span style={{
                fontSize: 'clamp(3.5rem, 12vw, 5.5rem)',
                fontWeight: '800',
                color: scoreColor,
                lineHeight: 1,
                display: 'block',
                textShadow: `0 0 30px ${scoreColor}60`,
              }}>
                {score}
              </span>
              <span style={{ color: '#4b5563', fontSize: '1.1rem', fontWeight: '600' }}>/10</span>
            </div>
          )}

          <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
            {score === null ? "Here's your performance summary from Smith" :
              score >= 8 ? '🎉 Excellent performance!' :
              score >= 5 ? '👍 Good effort, keep practicing!' :
              '💪 Keep going, you\'ll get there!'}
          </p>
        </div>

        {/* Summary card */}
        <div style={{
          background: '#111',
          border: '1px solid #1f1f1f',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid #1a1a1a',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0a0a0a', fontWeight: '800', fontSize: '11px',
              flexShrink: 0,
            }}>S</div>
            <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '600' }}>Smith's Feedback</span>
          </div>
          <div style={{
            padding: '20px',
            color: '#d1d5db',
            fontSize: '13px',
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
            maxHeight: '320px',
            overflowY: 'auto',
          }}>
            {summaryContent}
          </div>
        </div>

        {/* Try Again button */}
        <button
          id="try-again-btn"
          onClick={onRestart}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
            color: '#0a0a0a',
            fontFamily: 'inherit',
            fontWeight: '800',
            fontSize: '14px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '0 0 24px rgba(0,255,136,0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 0 36px rgba(0,255,136,0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 0 24px rgba(0,255,136,0.3)';
          }}
        >
          🔄 Try Again
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;
