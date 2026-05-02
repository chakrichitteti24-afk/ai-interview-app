import React from 'react';

const Logo = ({ size = 'medium', showText = true }) => {
  const dimensions = size === 'small' ? { icon: 24, text: '1.2rem' } : { icon: 40, text: '2rem' };
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      userSelect: 'none',
    }}>
      <svg 
        width={dimensions.icon} 
        height={dimensions.icon} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M13 2L3 14H12L11 22L21 10H12L13 2Z" 
          stroke="#00ff88" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="rgba(0, 255, 136, 0.1)"
        />
        <circle cx="12" cy="12" r="9" stroke="#00ff88" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
      </svg>
      
      {showText && (
        <span style={{
          fontSize: dimensions.text,
          fontWeight: '800',
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #ffffff 0%, #00ff88 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: '"JetBrains Mono", monospace',
        }}>
          PrepIQ
        </span>
      )}
    </div>
  );
};

export default Logo;
