import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { questions } from '../data/questions';
import { GameHeader } from '../components/game/GameHeader';
import { QuestionEngine } from '../components/game/QuestionEngine';

export const Game = () => {
  const { progress } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (!progress.name) {
      navigate('/');
    } else if (progress.isFinished) {
      navigate('/result');
    }
  }, [progress, navigate]);

  if (!progress.name || progress.isFinished) return null;

  const currentQuestion = questions[progress.currentQuestionIndex];

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0f1d]">
      <GameHeader />
      <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start pt-8">
        <QuestionEngine question={currentQuestion} />
      </div>
    </div>
  );
};
