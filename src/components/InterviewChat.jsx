import React, { useState, useEffect, useRef, useCallback } from 'react';

const InterviewChat = ({ messages, isLoading, onSendMessage, questionCount }) => {
  const [input, setInput] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [showInput, setShowInput] = useState(false);
  const silenceTimerRef = useRef(null);

  // ── Voice Output state ──────────────────────────────────────────────────────
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const lastSpokenIndexRef = useRef(-1);
  const pendingTextRef = useRef('');
  const [selectedVoice, setSelectedVoice] = useState(null);

  // ── Voice Input state ───────────────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);

  // ── Sync muted ref ──────────────────────────────────────────────────────────
  useEffect(() => {
    isMutedRef.current = isMuted;
    if (isMuted) window.speechSynthesis.cancel();
  }, [isMuted]);

  // ── Load consistent voice on component mount ────────────────────────────────
  useEffect(() => {
    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Prefer these voices in order:
      const preferred = [
        'Google US English',
        'Microsoft David',
        'Microsoft Mark',
        'en-US',
        'en-GB',
        'en-IN'
      ];
      let voice = null;
      for (const name of preferred) {
        voice = voices.find(v => v.name.includes(name) || v.lang.includes(name));
        if (voice) break;
      }
      if (!voice) voice = voices.find(v => v.lang.startsWith('en'));
      setSelectedVoice(voice);
    };
    
    window.speechSynthesis.onvoiceschanged = loadVoice;
    loadVoice();
  }, []);

  // ── Speak function with word-by-word sync ───────────────────────────────────
  const speak = useCallback(async (text) => {
    if (isMutedRef.current || !window.speechSynthesis) {
      setDisplayText(text);
      setShowInput(true);
      return;
    }
    
    // Cancel previous speech and wait before starting new
    window.speechSynthesis.cancel();
    await new Promise(r => setTimeout(r, 100));
    
    // Before speech: show only robot, no text
    setDisplayText('');
    setShowInput(false);
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Use consistent voice settings
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    const words = text.split(' ');

    // Use onboundary event for exact word timing
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const spokenText = text.substring(0, event.charIndex + event.charLength);
        const wordCount = spokenText.trim().split(/\s+/).length;
        setDisplayText(words.slice(0, wordCount).join(' '));
      }
    };

    utterance.onstart = () => {
      setIsAISpeaking(true);
    };
    
    utterance.onend = () => {
      setIsAISpeaking(false);
      setDisplayText(text);
      setShowInput(true);
    };
    
    utterance.onerror = () => {
      setIsAISpeaking(false);
      setDisplayText(text);
      setShowInput(true);
    };

    window.speechSynthesis.speak(utterance);
  }, [selectedVoice]);

  // ── Auto-speak new AI messages ──────────────────────────────────────────────
  useEffect(() => {
    const lastAssistantIdx = messages.reduce((acc, msg, idx) =>
      msg.role === 'assistant' ? idx : acc, -1);
    if (lastAssistantIdx > lastSpokenIndexRef.current) {
      lastSpokenIndexRef.current = lastAssistantIdx;
      pendingTextRef.current = messages[lastAssistantIdx].content;
      
      // BUG 2 FIX: Cleanup before new question
      window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
      setDisplayText('');
      setInput('');
      setInterimText('');
      setIsListening(false);
      
      setTimeout(() => speak(messages[lastAssistantIdx].content), 300);
    }
  }, [messages, speak]);

  // ── SpeechRecognition setup ─────────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setInput(finalTranscript);
      setInterimText(interimTranscript);
    };

    recognition.onspeechend = () => {
      silenceTimeoutRef.current = setTimeout(() => {
        recognition.stop();
        if (input.trim()) {
          onSendMessage(input.trim());
          setInput('');
        }
      }, 2000);
    };

    recognition.onerror = (e) => {
      console.error('Speech error:', e.error);
      // Only stop listening on fatal errors
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;
  }, [onSendMessage, input]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimText('');
      clearTimeout(silenceTimeoutRef.current);
    } else {
      setInterimText('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const doSubmit = useCallback(() => {
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
      setInterimText('');
    }
  }, [input, isLoading, onSendMessage]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    doSubmit();
  };

  // Get the latest assistant message to display as floating question
  // Progress calc
  const progress = Math.min((questionCount / 10) * 100, 100);

  return (
    <div className="interview-container" style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: '#080d1f',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: '"Outfit", sans-serif',
      color: '#fff',
    }}>
      {/* ── Background gradient (single theme) ─────────────────────────────── */}
      <div className="earth-container" style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 70% 30%, rgba(0, 255, 136, 0.08) 0%, transparent 50%)',
        zIndex: 0,
      }} />

      {/* ── Header (Minimal, no boxes) ────────────────────────────────────────────── */}
      <header style={{
        padding: '30px 50px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
      }}>
        <div style={{ fontSize: '12px', letterSpacing: '4px', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>
          SESSION PREP <span style={{ color: '#00ff88' }}>{Math.min(questionCount + 1, 10)}/10</span>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {/* Progress Line */}
          <div style={{ width: '150px', height: '2px', background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${progress}%`, background: '#00ff88', transition: 'width 0.5s' }} />
          </div>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, color: '#fff', fontSize: '18px' }}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </header>

      {/* ── Main Workspace (Full screen, no boxes) ───────────────────────────────── */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        padding: '0 80px',
        position: 'relative',
        zIndex: 5,
      }}>
        
        {/* Left Side: Floating Question */}
        <div style={{
          flex: 1,
          maxWidth: '500px',
          animation: 'fadeInQuestion 1s ease-out',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          {/* Question text - floats directly on background, no box */}
          <div className="question-text" style={{
            fontSize: '20px',
            fontWeight: '500',
            lineHeight: '1.6',
            color: '#fff',
            textShadow: '0 0 30px rgba(0, 255, 136, 0.3)',
            minHeight: '60px',
          }}>
            {displayText || (!isAISpeaking && 'Welcome! I am ready to start.')}
          </div>
          
          {isLoading && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <div className="think-dot" style={{ width: '6px', height: '6px', background: '#00ff88', borderRadius: '50%', animation: 'think 1s infinite' }} />
              <div className="think-dot" style={{ width: '6px', height: '6px', background: '#00ff88', borderRadius: '50%', animation: 'think 1s infinite 0.2s' }} />
              <div className="think-dot" style={{ width: '6px', height: '6px', background: '#00ff88', borderRadius: '50%', animation: 'think 1s infinite 0.4s' }} />
            </div>
          )}
        </div>

        {/* Right Side: Robot Avatar (Center-right, transparent, no borders) */}
        <div className="robot-avatar" style={{
          position: 'relative',
          width: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '280px',
            height: '280px',
            position: 'relative',
            animation: 'floatRobot 6s infinite ease-in-out',
          }}>
            {/* Robot Face - transparent, no borders */}
            <div style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              zIndex: 3,
            }}>
              {/* Eyes - larger */}
              <div style={{ display: 'flex', gap: '60px', justifyContent: 'center', marginTop: '100px' }}>
                <div style={{
                  width: '35px', height: '35px', background: '#00ff88', borderRadius: '50%',
                  boxShadow: '0 0 25px #00ff88',
                  animation: isAISpeaking ? 'pulseEye 0.5s infinite alternate' : 'blinkEye 5s infinite',
                }} />
                <div style={{
                  width: '35px', height: '35px', background: '#00ff88', borderRadius: '50%',
                  boxShadow: '0 0 25px #00ff88',
                  animation: isAISpeaking ? 'pulseEye 0.5s infinite alternate' : 'blinkEye 5s infinite',
                }} />
              </div>
              
              {/* Subtle mouth line */}
              <div style={{
                width: '60px', height: '3px', background: 'rgba(0,255,136,0.3)', borderRadius: '2px',
                margin: '50px auto 0',
              }} />
            </div>

            {/* Sound Waves (visible when AI speaks) */}
            {isAISpeaking && (
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '6px',
                alignItems: 'flex-end',
                height: '40px',
              }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{
                    width: '4px',
                    background: '#00ff88',
                    animation: `wave 0.5s infinite ease-in-out ${i * 0.1}s`,
                    borderRadius: '2px',
                  }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer Input (Only visible after speech complete, glowing underline) ───────────────────────────── */}
      {showInput && (
        <footer className="input-container" style={{
          padding: '40px 80px 60px',
          zIndex: 10,
        }}>
          {/* Interim transcript (grey text while speaking) */}
          {interimText && (
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '15px', fontStyle: 'italic' }}>
              {interimText}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            borderBottom: `2px solid ${isListening ? '#00ff88' : 'rgba(255,255,255,0.2)'}`,
            transition: 'border-color 0.3s, box-shadow 0.3s',
            boxShadow: isListening ? '0 4px 20px rgba(0, 255, 136, 0.3)' : 'none',
            paddingBottom: '10px',
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Speak or type your response..."
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '18px',
                outline: 'none',
                padding: '10px 0',
              }}
            />
            
            <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={toggleListening}
                className={isListening ? 'mic-pulse' : ''}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isListening ? '#ff4444' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'color 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: input.trim() ? '#00ff88' : 'rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  transition: 'color 0.3s',
                }}
              >
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </form>
        </footer>
      )}

      {/* ── Keyframes ──────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap');
        
        @keyframes floatRobot {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes blinkEye {
          0%, 48%, 52%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.1); }
        }
        @keyframes pulseEye {
          from { transform: scale(1); opacity: 1; }
          to { transform: scale(1.1); opacity: 0.7; }
        }
        @keyframes fadeInQuestion {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes think {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes wave {
          0%, 100% { height: 10px; }
          50% { height: 30px; }
        }
        .mic-pulse {
          animation: micPulse 1s infinite ease-in-out;
        }
        @keyframes micPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          /* Fix text wrapping - MOST IMPORTANT */
          .question-text {
            font-size: 15px !important;
            white-space: normal !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            line-height: 1.6 !important;
            padding: 0 16px !important;
            text-align: left !important;
            width: 90% !important;
          }

          /* Robot smaller */
          .robot-avatar {
            width: 80px !important;
            height: 80px !important;
          }

          /* Hide earth on mobile */
          .earth-container {
            display: none !important;
          }

          /* Input bar full width */
          .input-container {
            width: 100% !important;
            padding: 8px 12px !important;
          }

          /* Overall container */
          .interview-container {
            padding: 8px !important;
            overflow-x: hidden !important;
          }

          header {
            padding: 20px 16px !important;
          }
          main {
            flex-direction: column !important;
            padding: 0 16px !important;
            gap: 20px !important;
          }
          main > div:first-child {
            max-width: 100% !important;
            order: 2 !important;
          }
          main > div:last-child {
            order: 1 !important;
          }
          main > div:last-child > div {
            width: 80px !important;
            height: 80px !important;
          }
          main > div:last-child > div > div > div {
            margin-top: 20px !important;
            gap: 20px !important;
          }
          main > div:last-child > div > div > div > div {
            width: 15px !important;
            height: 15px !important;
          }
          footer {
            padding: 20px 16px 40px !important;
          }
          form {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InterviewChat;
