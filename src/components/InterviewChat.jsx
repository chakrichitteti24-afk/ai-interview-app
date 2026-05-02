import React, { useState, useEffect, useRef, useCallback } from 'react';
import FeedbackBubble from './FeedbackBubble';

const InterviewChat = ({ messages, isLoading, onSendMessage, questionCount }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // ── Voice Output state ──────────────────────────────────────────────────────
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const lastSpokenIndexRef = useRef(-1);

  // ── Voice Input state ───────────────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // ── Sync muted ref ──────────────────────────────────────────────────────────
  useEffect(() => {
    isMutedRef.current = isMuted;
    if (isMuted) window.speechSynthesis.cancel();
  }, [isMuted]);

  // ── Speak function ──────────────────────────────────────────────────────────
  const speak = useCallback((text) => {
    if (isMutedRef.current || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))
    ) || voices.find(v => v.lang === 'en-US') || voices[0];
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  }, []);

  // ── Auto-speak new AI messages ──────────────────────────────────────────────
  useEffect(() => {
    const lastAssistantIdx = messages.reduce((acc, msg, idx) =>
      msg.role === 'assistant' ? idx : acc, -1);
    if (lastAssistantIdx > lastSpokenIndexRef.current) {
      lastSpokenIndexRef.current = lastAssistantIdx;
      setTimeout(() => speak(messages[lastAssistantIdx].content), 300);
    }
  }, [messages, speak]);

  // ── SpeechRecognition setup ─────────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      setTimeout(() => {
        if (transcript.trim()) {
          onSendMessage(transcript.trim());
          setInput('');
        }
      }, 600);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, [onSendMessage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // ── Scroll & submit ─────────────────────────────────────────────────────────
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const displayMessages = messages.filter((msg, idx) => !(idx === 0 && msg.role === 'user'));
  const progress = Math.min((questionCount / 10) * 100, 100);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100dvh - 70px)',
      maxWidth: '760px',
      margin: '0 auto',
      background: '#0a0a0a',
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    }}>

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header style={{
        padding: '14px 20px 0',
        borderBottom: '1px solid #1a1a1a',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>

          {/* Smith avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0a0a0a', fontWeight: '800', fontSize: '14px',
              boxShadow: '0 0 12px rgba(0,255,136,0.4)',
              flexShrink: 0,
            }}>S</div>
            <div>
              <div style={{ color: '#fff', fontWeight: '700', fontSize: '14px', lineHeight: 1 }}>Smith</div>
              <div style={{ color: '#00ff88', fontSize: '10px', letterSpacing: '0.08em', marginTop: '3px' }}>● AI Interviewer</div>
            </div>
          </div>

          {/* Question counter + mute */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '6px 14px',
              borderRadius: '999px',
              background: '#111',
              border: '1px solid #2a2a2a',
              color: '#9ca3af',
              fontSize: '12px',
            }}>
              Q <span style={{ color: '#00ff88', fontWeight: '700' }}>{Math.min(questionCount + 1, 10)}</span>
              <span style={{ color: '#374151' }}>/10</span>
            </div>

            {/* Mute toggle */}
            <button
              id="voice-mute-toggle"
              onClick={() => setIsMuted(m => !m)}
              title={isMuted ? 'Unmute Smith' : 'Mute Smith'}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '8px',
                border: `1px solid ${isMuted ? '#374151' : '#2a2a2a'}`,
                background: isMuted ? '#1a1a1a' : 'transparent',
                color: isMuted ? '#6b7280' : '#9ca3af',
                fontFamily: 'inherit', fontSize: '11px',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {isMuted ? (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-4.243-4.243M12 18l4.243-4.243M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z" />
                </svg>
              )}
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '2px', background: '#1a1a1a', borderRadius: '999px', marginBottom: '0', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #00ff88, #00cc6a)',
            borderRadius: '999px',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </header>

      {/* ── Messages ─────────────────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {displayMessages.map((msg, index) => {
          if (msg.role === 'assistant') {
            return <FeedbackBubble key={index} content={msg.content} />;
          }
          return (
            <div key={index} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{
                maxWidth: '80%',
                background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                color: '#0a0a0a',
                borderRadius: '18px 18px 4px 18px',
                padding: '12px 16px',
                fontSize: '13px',
                lineHeight: 1.6,
                fontWeight: '500',
                boxShadow: '0 2px 12px rgba(0,255,136,0.2)',
              }}>
                {msg.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              background: '#111',
              border: '1px solid #1f1f1f',
              borderRadius: '18px 18px 18px 4px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              {[0, 150, 300].map(delay => (
                <div key={delay} style={{
                  width: '7px', height: '7px',
                  borderRadius: '50%',
                  background: '#00ff88',
                  animation: 'bounce 1s infinite',
                  animationDelay: `${delay}ms`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input bar ────────────────────────────────────────────────────────── */}
      <div style={{
        padding: '12px 16px 16px',
        borderTop: '1px solid #1a1a1a',
        background: '#0a0a0a',
        flexShrink: 0,
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

          {/* Text input */}
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={isListening ? '🎙️ Listening…' : 'Type your answer…'}
            style={{
              flex: 1,
              background: '#111',
              border: `1px solid ${isListening ? '#ef4444' : '#2a2a2a'}`,
              borderRadius: '12px',
              padding: '13px 16px',
              color: '#fff',
              fontFamily: 'inherit',
              fontSize: '13px',
              outline: 'none',
              transition: 'border-color 0.15s',
              opacity: isLoading ? 0.5 : 1,
            }}
            onFocus={e => { if (!isListening) e.target.style.borderColor = '#3a3a3a'; }}
            onBlur={e => { if (!isListening) e.target.style.borderColor = '#2a2a2a'; }}
          />

          {/* Mic button */}
          <button
            id="voice-mic-btn"
            type="button"
            onClick={toggleListening}
            disabled={isLoading}
            title={isListening ? 'Stop listening' : 'Speak your answer'}
            style={{
              width: '46px', height: '46px',
              borderRadius: '12px',
              border: 'none',
              background: isListening ? '#ef4444' : '#1a1a1a',
              color: isListening ? '#fff' : '#9ca3af',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s',
              boxShadow: isListening ? '0 0 16px rgba(239,68,68,0.5)' : 'none',
              animation: isListening ? 'micPulse 1.5s ease-in-out infinite' : 'none',
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4m-4 0h8" />
            </svg>
          </button>

          {/* Send button */}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              width: '46px', height: '46px',
              borderRadius: '12px',
              border: 'none',
              background: input.trim() && !isLoading
                ? 'linear-gradient(135deg, #00ff88, #00cc6a)'
                : '#1a1a1a',
              color: input.trim() && !isLoading ? '#0a0a0a' : '#374151',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s',
              boxShadow: input.trim() && !isLoading ? '0 0 14px rgba(0,255,136,0.3)' : 'none',
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>

      {/* Bounce keyframes */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        @keyframes micPulse {
          0%, 100% { box-shadow: 0 0 16px rgba(239,68,68,0.5); }
          50% { box-shadow: 0 0 28px rgba(239,68,68,0.8); }
        }
      `}</style>
    </div>
  );
};

export default InterviewChat;
