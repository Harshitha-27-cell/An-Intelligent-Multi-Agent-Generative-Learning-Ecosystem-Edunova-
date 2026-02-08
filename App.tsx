
import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import LearningPathAgent from './pages/LearningPathAgent';
import InterviewAgent from './pages/InterviewAgent';
import QuizAgent from './pages/QuizAgent';
import Community from './pages/Community';
import FlashcardAgent from './pages/FlashcardAgent';
import ATSResumeScorer from './pages/ATSResumeScorer';
import AIStudyAssistant from './pages/AIStudyAssistant';

export type Page = 'landing' | 'login' | 'signup' | 'dashboard' | 'learning-path' | 'interview' | 'quiz' | 'community' | 'flashcards' | 'ats-scorer' | 'study-assistant';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  const navigate = (page: Page) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={navigate} />;
      case 'login':
        return <LoginPage onNavigate={navigate} />;
      case 'signup':
        return <SignupPage onNavigate={navigate} />;
      case 'dashboard':
        return <Dashboard onNavigate={navigate} />;
      case 'learning-path':
        return <LearningPathAgent onNavigate={navigate} />;
      case 'interview':
        return <InterviewAgent onNavigate={navigate} />;
      case 'quiz':
        return <QuizAgent onNavigate={navigate} />;
      case 'community':
        return <Community onNavigate={navigate} />;
      case 'flashcards':
        return <FlashcardAgent onNavigate={navigate} />;
      case 'ats-scorer':
        return <ATSResumeScorer onNavigate={navigate} />;
      case 'study-assistant':
        return <AIStudyAssistant onNavigate={navigate} />;
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen selection:bg-blue-500/30 bg-[#0a0f1d]">
      {renderPage()}
    </div>
  );
};

export default App;
