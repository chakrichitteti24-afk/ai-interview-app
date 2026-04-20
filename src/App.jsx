import React, { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import SetupScreen from './components/SetupScreen';
import InterviewChat from './components/InterviewChat';
import ResultScreen from './components/ResultScreen';
import { useInterview } from './hooks/useInterview';

function App() {
  const [appState, setAppState] = useState('HOME'); // HOME, SETUP, CHAT, RESULT
  
  const { 
    messages, 
    isLoading, 
    isFinished, 
    questionCount, 
    error,
    startInterview, 
    sendMessage 
  } = useInterview();

  // Watch for interview finish to transition to RESULT screen
  React.useEffect(() => {
    if (isFinished) {
      setAppState('RESULT');
    }
  }, [isFinished]);

  const handleStartSetup = () => {
    setAppState('SETUP');
  };

  const handleSetupComplete = (role, experience) => {
    startInterview(role, experience);
    setAppState('CHAT');
  };

  const handleRestart = () => {
    setAppState('HOME');
  };

  return (
    <div className="min-h-screen bg-background text-white font-mono selection:bg-accent selection:text-background">
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-900/90 border border-red-500 text-red-100 px-6 py-3 rounded-lg z-50 shadow-lg">
          {error}
        </div>
      )}

      {appState === 'HOME' && (
        <HomeScreen onStart={handleStartSetup} />
      )}
      
      {appState === 'SETUP' && (
        <SetupScreen onComplete={handleSetupComplete} />
      )}
      
      {appState === 'CHAT' && (
        <InterviewChat 
          messages={messages} 
          isLoading={isLoading} 
          onSendMessage={sendMessage}
          questionCount={questionCount}
        />
      )}

      {appState === 'RESULT' && (
        <ResultScreen 
          messages={messages} 
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;
