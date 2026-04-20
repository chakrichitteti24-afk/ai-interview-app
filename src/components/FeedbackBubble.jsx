import React from 'react';

const FeedbackBubble = ({ content }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: '8px' }}>
      {/* Smith avatar */}
      <div style={{
        width: '30px', height: '30px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#0a0a0a', fontWeight: '800', fontSize: '11px',
        flexShrink: 0,
        boxShadow: '0 0 10px rgba(0,255,136,0.3)',
        marginBottom: '2px',
      }}>
        S
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '80%',
        background: '#111',
        border: '1px solid #1f1f1f',
        borderRadius: '18px 18px 18px 4px',
        padding: '12px 16px',
        fontSize: '13px',
        color: '#e5e7eb',
        lineHeight: 1.7,
        whiteSpace: 'pre-wrap',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          color: '#00ff88',
          fontSize: '10px',
          fontWeight: '700',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}>
          Smith
        </div>
        {content}
      </div>
    </div>
  );
};

export default FeedbackBubble;
