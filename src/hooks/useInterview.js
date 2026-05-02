import { useState } from 'react';
import { SYSTEM_PROMPT } from '../utils/prompts';
import { supabase } from '../lib/supabase';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const useInterview = () => {
  const [role, setRole] = useState(null);
  const [experience, setExperience] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [error, setError] = useState(null);

  const speakText = (text) => {
    // Basic text cleanup for speaking
    const cleanText = text.replace(/[*#]/g, '').trim();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;
    
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;
    
    window.speechSynthesis.speak(utterance);
  };

  const saveToSupabase = async (finalMessages, role, experience) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const summaryMessage = [...finalMessages].reverse().find(m => m.role === 'assistant');
      const scoreMatch = summaryMessage?.content.match(/(\d{1,2})\s*(?:\/|out of)\s*10/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

      const { error } = await supabase
        .from('interview_sessions')
        .insert([
          {
            user_id: session.user.id,
            role: role,
            experience: experience,
            score: score,
            chat_history: finalMessages,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;
    } catch (err) {
      console.error('Error saving session:', err);
    }
  };

  const startInterview = async (selectedRole, selectedExperience) => {
    setRole(selectedRole);
    setExperience(selectedExperience);
    setMessages([]);
    setQuestionCount(0);
    setIsFinished(false);
    setError(null);
    
    // Trigger the first message from AI
    await fetchGroqResponse([
      { role: 'user', content: `Hi, I am ready for the mock interview. I am applying for the role of ${selectedRole} with an experience level of ${selectedExperience}. Please start by asking the first question.` }
    ], false, selectedRole, selectedExperience);
  };

  const sendMessage = async (userText) => {
    if (!userText.trim()) return;

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);

    if (questionCount >= 10) {
      // Add final prompt to get performance summary
      const finalPromptMessages = [...newMessages, { role: 'user', content: "That was the last question. Please provide an overall performance summary including a score out of 10." }];
      await fetchGroqResponse(finalPromptMessages, true, role, experience);
    } else {
      await fetchGroqResponse(newMessages, false, role, experience);
    }
  };

  const fetchGroqResponse = async (chatHistory, isFinal = false, currentRole, currentExp) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiKey = API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found.");
      }

      const groqMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...chatHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: groqMessages,
            temperature: 0.7,
          })
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || "Failed to fetch response");
      }

      const data = await response.json();
      const aiResponseText = data.choices[0].message.content;
      const updatedMessages = [...chatHistory, { role: 'assistant', content: aiResponseText }];

      setMessages(updatedMessages);
      speakText(aiResponseText);

      if (isFinal) {
        setIsFinished(true);
        await saveToSupabase(updatedMessages, currentRole, currentExp);
      } else {
        setQuestionCount(prev => prev + 1);
      }

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    role,
    experience,
    messages,
    isLoading,
    isFinished,
    questionCount,
    error,
    startInterview,
    sendMessage,
    speakText
  };
};

