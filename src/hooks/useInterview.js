import { useState } from 'react';
import { SYSTEM_PROMPT } from '../utils/prompts';

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
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 1;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.onvoiceschanged = () => {
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) utterance.voice = englishVoice;
    };
    window.speechSynthesis.speak(utterance);
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
    ]);
  };

  const sendMessage = async (userText) => {
    if (!userText.trim()) return;

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);

    if (questionCount >= 10) {
      // Add final prompt to get performance summary
      const finalMessages = [...newMessages, { role: 'user', content: "That was the last question. Please provide an overall performance summary." }];
      await fetchGroqResponse(finalMessages, true);
    } else {
      await fetchGroqResponse(newMessages);
    }
  };

  const fetchGroqResponse = async (chatHistory, isFinal = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiKey = API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found. Please set API_KEY in useInterview.js");
      }

      // Build messages array with system prompt + chat history
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
            model: 'llama-3.3-70b-versatile',
            messages: groqMessages
          })
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || "Failed to fetch response from Groq");
      }

      const data = await response.json();
      const aiResponseText = data.choices[0].message.content;

      setMessages([...chatHistory, { role: 'assistant', content: aiResponseText }]);
      speakText(aiResponseText);

      if (isFinal) {
        setIsFinished(true);
      } else {
        // Increment question count only after AI responds
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
