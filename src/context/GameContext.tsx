import React, { createContext, useContext, useState, useEffect } from 'react';
import { questions, QuestionCategory } from '../data/questions';

export interface UserProgress {
  name: string;
  turma: string;
  startTime: number;
  endTime: number | null;
  duration: number; // in seconds
  answers: Record<number, boolean>;
  correctCount: number;
  xp: number;
  percentage: number;
  currentQuestionIndex: number;
  isFinished: boolean;
  performance: Record<QuestionCategory, { total: number; correct: number }>;
}

const defaultProgress: UserProgress = {
  name: '',
  turma: '',
  startTime: 0,
  endTime: null,
  duration: 0,
  answers: {},
  correctCount: 0,
  xp: 0,
  percentage: 0,
  currentQuestionIndex: 0,
  isFinished: false,
  performance: {
    'FUNDAMENTOS': { total: 0, correct: 0 },
    'CONCEITUAL': { total: 0, correct: 0 },
    'LÓGICO': { total: 0, correct: 0 },
    'TIPOS': { total: 0, correct: 0 },
    'SQL': { total: 0, correct: 0 },
    'INTEGRAÇÃO': { total: 0, correct: 0 },
    'MODELO LÓGICO': { total: 0, correct: 0 },
  }
};

interface GameContextType {
  progress: UserProgress;
  startGame: (name: string, turma: string) => void;
  answerQuestion: (isCorrect: boolean, xpGained: number, category: QuestionCategory) => void;
  finishGame: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('bd_challenge_current');
    return saved ? JSON.parse(saved) : defaultProgress;
  });

  useEffect(() => {
    localStorage.setItem('bd_challenge_current', JSON.stringify(progress));
  }, [progress]);

  // Also update timer duration while not finished
  useEffect(() => {
    if (progress.startTime > 0 && !progress.isFinished) {
      const interval = setInterval(() => {
        setProgress(p => ({ ...p, duration: Math.floor((Date.now() - p.startTime) / 1000) }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [progress.startTime, progress.isFinished]);

  const startGame = (name: string, turma: string) => {
    setProgress({
      ...defaultProgress,
      name,
      turma,
      startTime: Date.now()
    });
  };

  const answerQuestion = (isCorrect: boolean, xpGained: number, category: QuestionCategory) => {
    setProgress(p => {
      const newIndex = p.currentQuestionIndex + 1;
      const questionId = questions[p.currentQuestionIndex].id;
      
      const newAnswers = { ...p.answers, [questionId]: isCorrect };
      const newCorrectCount = p.correctCount + (isCorrect ? 1 : 0);
      const newXp = p.xp + (isCorrect ? xpGained : 0);
      
      const perfCat = p.performance[category] || { total: 0, correct: 0 };
      const newPerformance = {
        ...p.performance,
        [category]: {
          total: perfCat.total + 1,
          correct: perfCat.correct + (isCorrect ? 1 : 0)
        }
      };

      const isFinished = newIndex >= questions.length;
      let endTime = p.endTime;
      if (isFinished) {
        endTime = Date.now();
        // save to leaderboard
        const leaderboard = JSON.parse(localStorage.getItem('bd_challenge_users') || '[]');
        leaderboard.push({
          name: p.name,
          turma: p.turma,
          xp: newXp,
          duration: p.duration,
          correctCount: newCorrectCount,
          percentage: Math.round((newCorrectCount / questions.length) * 100),
          endTime,
          performance: newPerformance,
          answers: newAnswers
        });
        localStorage.setItem('bd_challenge_users', JSON.stringify(leaderboard));
      }

      return {
        ...p,
        answers: newAnswers,
        correctCount: newCorrectCount,
        xp: newXp,
        percentage: Math.round((newCorrectCount / questions.length) * 100),
        performance: newPerformance,
        currentQuestionIndex: newIndex,
        isFinished,
        endTime
      };
    });
  };

  const finishGame = () => {
    // Force finish if not already
  };

  const resetGame = () => {
    setProgress(defaultProgress);
    localStorage.removeItem('bd_challenge_current');
  };

  return (
    <GameContext.Provider value={{ progress, startGame, answerQuestion, finishGame, resetGame }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
