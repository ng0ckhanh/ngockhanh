import React, { useState } from 'react';
import { GameDifficulty, Question, TopicId } from './types';
import { getStoredQuestions, getQuestionsByTopic } from './utils/questionStorage';
import { MainMenu } from './components/MainMenu';
import { QuestionManager } from './components/QuestionManager';
import { TopicSelector } from './components/TopicSelector';
import { GameCanvas } from './components/GameCanvas';
import { InstructionModal } from './components/InstructionModal';

export type AppView = 'menu' | 'manage_questions' | 'select_topic' | 'playing';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('menu');
  const [selectedTopic, setSelectedTopic] = useState<TopicId>('it');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [showInstructions, setShowInstructions] = useState(false);

  // Navigate to Topic Selector
  const handleStartGameFlow = () => {
    setCurrentView('select_topic');
  };

  // Launch Game with chosen Topic and Difficulty
  const handleLaunchGame = (topic: TopicId, diff: GameDifficulty) => {
    setSelectedTopic(topic);
    setDifficulty(diff);
    const questionsForGame = getQuestionsByTopic(topic);
    setActiveQuestions(questionsForGame);
    setCurrentView('playing');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* 1. MAIN MENU */}
      {currentView === 'menu' && (
        <MainMenu
          onStartGame={handleStartGameFlow}
          onOpenQuestionManager={() => setCurrentView('manage_questions')}
          onOpenInstruction={() => setShowInstructions(true)}
        />
      )}

      {/* 2. QUESTION MANAGEMENT (Phần 1: CRUD & localStorage) */}
      {currentView === 'manage_questions' && (
        <QuestionManager
          onBack={() => setCurrentView('menu')}
          onStartGameWithTopic={topic => handleLaunchGame(topic, 'medium')}
        />
      )}

      {/* 3. TOPIC & DIFFICULTY SELECTOR (Phần 2: Menu chọn chủ đề vào chơi) */}
      {currentView === 'select_topic' && (
        <TopicSelector
          onBack={() => setCurrentView('menu')}
          onStartGame={handleLaunchGame}
          onOpenQuestionManager={() => setCurrentView('manage_questions')}
        />
      )}

      {/* 4. GAME CANVAS (Phần 3, 4, 5, 6) */}
      {currentView === 'playing' && (
        <GameCanvas
          topicId={selectedTopic}
          difficulty={difficulty}
          questions={activeQuestions.length > 0 ? activeQuestions : getStoredQuestions()}
          onBackToMenu={() => setCurrentView('menu')}
          onChangeTopic={() => setCurrentView('select_topic')}
          onOpenInstruction={() => setShowInstructions(true)}
        />
      )}

      {/* INSTRUCTIONS MODAL */}
      {showInstructions && (
        <InstructionModal onClose={() => setShowInstructions(false)} />
      )}
    </div>
  );
}
