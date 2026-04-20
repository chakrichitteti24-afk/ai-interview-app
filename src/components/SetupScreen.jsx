import React, { useState } from 'react';

const ROLES = [
  { id: 'SWE',     label: '💻 Software Engineer' },
  { id: 'DA',      label: '📊 Data Analyst' },
  { id: 'PM',      label: '🧩 Product Manager' },
  { id: 'Cyber',   label: '🔐 Cybersecurity' },
  { id: 'Govt',    label: '🏛️ Govt / UPSC' },
  { id: 'Design',  label: '🎨 UI/UX Designer' },
];

const EXP_LEVELS = [
  { id: 'Fresher',  label: 'Fresher',    sub: '0 yrs' },
  { id: '1-2 years', label: '1–2 Years', sub: 'Junior' },
  { id: '3-5 years', label: '3–5 Years', sub: 'Mid-level' },
];

const card = {
  background: '#111',
  border: '1px solid #1f1f1f',
  borderRadius: '16px',
  padding: '28px 24px',
  width: '100%',
  maxWidth: '520px',
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
};

const SetupScreen = ({ onComplete }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedExp, setSelectedExp] = useState(null);

  const ready = selectedRole && selectedExp;

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
      <div style={card}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ color: '#00ff88', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            Step 1 of 1
          </p>
          <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: '700', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            Setup Profile
          </h2>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
            Choose your role and experience level
          </p>
        </div>

        {/* Role Selection — 2-column grid */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ color: '#9ca3af', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
            Select Role
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}>
            {ROLES.map(role => {
              const active = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  id={`role-${role.id}`}
                  onClick={() => setSelectedRole(role.id)}
                  style={{
                    padding: '14px 12px',
                    borderRadius: '12px',
                    border: active ? '1.5px solid #00ff88' : '1.5px solid #2a2a2a',
                    background: active ? 'rgba(0,255,136,0.08)' : '#0a0a0a',
                    color: active ? '#00ff88' : '#6b7280',
                    fontFamily: 'inherit',
                    fontSize: '12px',
                    fontWeight: active ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    lineHeight: 1.4,
                    boxShadow: active ? '0 0 12px rgba(0,255,136,0.1)' : 'none',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = '#3a3a3a'; e.currentTarget.style.color = '#9ca3af'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#6b7280'; } }}
                >
                  {role.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience Level — 3 buttons in a row */}
        <div style={{ marginBottom: '36px' }}>
          <label style={{ color: '#9ca3af', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
            Experience Level
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '10px',
          }}>
            {EXP_LEVELS.map(exp => {
              const active = selectedExp === exp.id;
              return (
                <button
                  key={exp.id}
                  id={`exp-${exp.id}`}
                  onClick={() => setSelectedExp(exp.id)}
                  style={{
                    padding: '14px 8px',
                    borderRadius: '12px',
                    border: active ? '1.5px solid #00ff88' : '1.5px solid #2a2a2a',
                    background: active ? 'rgba(0,255,136,0.08)' : '#0a0a0a',
                    color: active ? '#00ff88' : '#6b7280',
                    fontFamily: 'inherit',
                    fontSize: '12px',
                    fontWeight: active ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                    boxShadow: active ? '0 0 12px rgba(0,255,136,0.1)' : 'none',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = '#3a3a3a'; e.currentTarget.style.color = '#9ca3af'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#6b7280'; } }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '2px' }}>{exp.label}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7 }}>{exp.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Next Button */}
        <button
          id="setup-next-btn"
          disabled={!ready}
          onClick={() => onComplete(selectedRole, selectedExp)}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            background: ready
              ? 'linear-gradient(135deg, #00ff88, #00cc6a)'
              : '#1a1a1a',
            color: ready ? '#0a0a0a' : '#374151',
            fontFamily: 'inherit',
            fontWeight: '700',
            fontSize: '14px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: ready ? 'pointer' : 'not-allowed',
            boxShadow: ready ? '0 0 24px rgba(0,255,136,0.3)' : 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { if (ready) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 36px rgba(0,255,136,0.45)'; } }}
          onMouseLeave={e => { if (ready) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(0,255,136,0.3)'; } }}
        >
          {ready ? 'Start Interview →' : 'Select role & experience'}
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;
