import React, { useMemo, useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { supabase } from '../lib/supabase';

const ResultScreen = ({ messages, onRestart, role, level, session }) => {
  const [savedToHistory, setSavedToHistory] = useState(false);
  
  // The final message from Smith contains the summary
  const summaryMessage = [...messages].reverse().find(m => m.role === 'assistant');
  const summaryContent = summaryMessage ? summaryMessage.content : 'No summary available.';

  // Try to extract a score from the summary text
  const scoreMatch = summaryContent.match(/(\d{1,2})\s*(?:\/|out of)\s*10/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

  // Calculate grade based on score
  const getGrade = (s) => {
    if (s === null) return null;
    if (s >= 90 || s >= 9) return { letter: 'S', color: '#ffd700', label: 'Superb' };
    if (s >= 75 || s >= 7.5) return { letter: 'A', color: '#00ff88', label: 'Excellent' };
    if (s >= 60 || s >= 6) return { letter: 'B', color: '#00ccff', label: 'Good' };
    return { letter: 'C', color: '#ff4d4d', label: 'Keep Practicing' };
  };
  
  const grade = getGrade(score);

  // Extract key feedback points
  const feedbackPoints = useMemo(() => {
    const points = [];
    const lines = summaryContent.split('\n');
    lines.forEach(line => {
      // Look for bullet points, numbered lists, or key phrases
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        points.push(trimmed.substring(1).trim());
      } else if (/^\d+\./.test(trimmed)) {
        points.push(trimmed.replace(/^\d+\.\s*/, ''));
      } else if (trimmed.includes('Strength') || trimmed.includes('Improvement') || trimmed.includes(' areas')) {
        points.push(trimmed);
      }
    });
    return points.slice(0, 5); // Max 5 points
  }, [summaryContent]);

  // Extract individual scores from messages to build pie chart data
  const chartData = useMemo(() => {
    const categories = {
      excellent: { name: 'Excellent (8-10)', value: 0, color: '#00ff88' },
      good: { name: 'Good (5-7)', value: 0, color: '#00ccff' },
      improvement: { name: 'Needs Improvement (0-4)', value: 0, color: '#ff4d4d' }
    };

    messages.forEach(msg => {
      if (msg.role === 'assistant' && msg !== summaryMessage) {
        const individualScoreMatch = msg.content.match(/Score:\s*(\d{1,2})\/10/i) || 
                                     msg.content.match(/(\d{1,2})\/10/i);
        if (individualScoreMatch) {
          const s = parseInt(individualScoreMatch[1]);
          if (s >= 8) categories.excellent.value++;
          else if (s >= 5) categories.good.value++;
          else categories.improvement.value++;
        }
      }
    });

    const hasData = Object.values(categories).some(c => c.value > 0);
    if (!hasData && score !== null) {
      if (score >= 8) categories.excellent.value = 1;
      else if (score >= 5) categories.good.value = 1;
      else categories.improvement.value = 1;
    }

    return Object.values(categories).filter(c => c.value > 0);
  }, [messages, summaryMessage, score]);

  const scoreColor = score === null ? '#9ca3af'
    : score >= 8 ? '#00ff88'
    : score >= 5 ? '#00ccff'
    : '#ff4d4d';

  // Save to history
  useEffect(() => {
    if (!savedToHistory && session?.user?.id && score !== null) {
      saveToHistory();
    }
  }, [session, score]);

  const saveToHistory = async () => {
    try {
      const { error } = await supabase
        .from('interview_sessions')
        .insert({
          user_id: session.user.id,
          role: role || 'General',
          level: level || 'Mid',
          score: score,
          date: new Date().toISOString(),
          feedback_summary: summaryContent.substring(0, 500)
        });
      
      if (error) {
        console.error('Error saving to history:', error);
        // Try to create table if it doesn't exist
        if (error.code === '42P01') {
          console.log('Table may not exist');
        }
      } else {
        setSavedToHistory(true);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      background: '#080d1f',
      padding: '100px 16px 40px',
      fontFamily: '"Outfit", sans-serif',
    }}>

      {/* Glow */}
      <div style={{
        position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: '400px', height: '300px',
        background: `radial-gradient(ellipse, ${scoreColor}15 0%, transparent 70%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '600px',
        display: 'flex', flexDirection: 'column', gap: '24px',
      }}>

        {/* Large Score Display */}
        {score !== null && (
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <span style={{
              fontSize: 'clamp(5rem, 15vw, 8rem)',
              fontWeight: '800',
              color: scoreColor,
              lineHeight: 1,
              display: 'block',
              textShadow: `0 0 40px ${scoreColor}80`,
            }}>
              {score}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.5rem', fontWeight: '600' }}>/10</span>
          </div>
        )}

        {/* Grade Badge */}
        {grade && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${grade.color}, ${grade.color}80)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 30px ${grade.color}60`,
            }}>
              <span style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: '#080d1f',
                lineHeight: 1,
              }}>{grade.letter}</span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: '600',
                color: '#080d1f',
                textTransform: 'uppercase',
              }}>{grade.label}</span>
            </div>
          </div>
        )}

        {/* Pie Chart */}
        {chartData.length > 0 && (
          <div style={{ 
            height: '280px', 
            width: '100%',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="40%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: '#080d1f', 
                    border: '1px solid rgba(0,255,136,0.3)', 
                    borderRadius: '8px', 
                    color: '#fff', 
                    fontSize: '12px' 
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '500' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Key Feedback Points */}
        {feedbackPoints.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <h3 style={{ 
              color: '#00ff88', 
              fontSize: '14px', 
              fontWeight: '700', 
              margin: '0 0 16px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Key Takeaways
            </h3>
            <ul style={{ 
              margin: 0, 
              padding: '0 0 0 20px', 
              color: 'rgba(255,255,255,0.8)',
              fontSize: '13px',
              lineHeight: 1.8,
            }}>
              {feedbackPoints.map((point, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            onClick={onRestart}
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
              color: '#080d1f',
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
          
          <button
            onClick={() => onRestart('history')}
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '12px',
              border: '2px solid rgba(0,255,136,0.3)',
              background: 'transparent',
              color: '#00ff88',
              fontFamily: 'inherit',
              fontWeight: '800',
              fontSize: '14px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(0,255,136,0.1)';
              e.currentTarget.style.borderColor = '#00ff88';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(0,255,136,0.3)';
            }}
          >
            � View History
          </button>
        </div>

        {savedToHistory && (
          <p style={{ 
            color: 'rgba(0,255,136,0.6)', 
            fontSize: '12px', 
            textAlign: 'center',
            margin: '10px 0 0',
          }}>
            ✓ Saved to your history
          </p>
        )}
      </div>
      
      <style>{`
        @media (max-width: 375px) {
          div > div > div {
            padding: 60px 12px 30px !important;
          }
          div > div > div > span:first-child {
            font-size: 4rem !important;
          }
          div > div > div > div {
            width: 60px !important;
            height: 60px !important;
          }
          div > div > div > div span:first-child {
            font-size: 1.8rem !important;
          }
          div > div > div > div span:last-child {
            font-size: 0.5rem !important;
          }
          div > div > div > div:last-of-type {
            flex-direction: column !important;
            gap: 10px !important;
          }
          div > div > div > div:last-of-type button {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ResultScreen;

