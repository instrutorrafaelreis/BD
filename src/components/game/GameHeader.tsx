import React from 'react';
import { useGame } from '../../context/GameContext';
import { questions } from '../../data/questions';
import { Clock, Star, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export const GameHeader = () => {
  const { progress } = useGame();
  
  const currentQ = questions[progress.currentQuestionIndex];
  if (!currentQ) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const difficultyColors = {
    'BÁSICO': 'text-green-400 border-green-400/30',
    'INTERMEDIÁRIO': 'text-cyan-400 border-cyan-400/30',
    'AVANÇADO': 'text-yellow-400 border-yellow-400/30',
    'BOSS': 'text-red-500 border-red-500/30 font-black animate-pulse'
  };

  return (
    <div className="bg-[#111827] border-b border-gray-800 p-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex flex-wrap gap-4 items-center justify-between">
        
        {/* User Info */}
        <div className="flex flex-col">
          <span className="font-bold text-lg text-white uppercase">{progress.name}</span>
          <span className="text-xs text-gray-400">{progress.turma}</span>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 min-w-[200px] max-w-md mx-4">
          <div className="flex justify-between text-xs mb-1 text-gray-400">
            <span>Questão {progress.currentQuestionIndex + 1}/{questions.length}</span>
            <span className="font-mono">{Math.round((progress.currentQuestionIndex / questions.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
            {questions.map((_, i) => (
              <div 
                key={i} 
                className={`flex-1 ${i < progress.currentQuestionIndex ? 'bg-cyan-500' : 'bg-transparent border-r border-gray-800'}`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm font-mono">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">{formatTime(progress.duration)}</span>
          </div>
          
          <div className={`px-2 py-1 border rounded-md text-xs ${difficultyColors[currentQ.difficulty]}`}>
            {currentQ.difficulty}
          </div>

          <motion.div 
            key={progress.xp}
            initial={{ scale: 1.5, color: '#00f0ff' }}
            animate={{ scale: 1, color: '#ffd700' }}
            className="flex items-center gap-1 font-bold text-yellow-400"
          >
            <Star className="w-4 h-4" />
            +{currentQ.xp} XP
          </motion.div>
        </div>

      </div>
    </div>
  );
};
