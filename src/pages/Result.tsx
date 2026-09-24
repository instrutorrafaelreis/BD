import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Trophy, Clock, Target, Star, Award, ChevronRight, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';

export const Result = () => {
  const { progress, resetGame } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (!progress.isFinished) {
      navigate('/');
    }
  }, [progress, navigate]);

  if (!progress.isFinished) return null;

  const note = (progress.percentage / 10).toFixed(1);
  const totalQuestions = Object.keys(progress.answers).length;

  const badges = [
    { id: '1', name: 'EXPLORADOR DE DADOS', icon: '🔍', earned: progress.percentage >= 50 },
    { id: '2', name: 'MESTRE DAS ENTIDADES', icon: '🧊', earned: progress.performance['CONCEITUAL']?.correct >= 5 },
    { id: '3', name: 'GUARDIÃO DAS CHAVES', icon: '🔑', earned: progress.performance['LÓGICO']?.correct >= 5 },
    { id: '4', name: 'SQL BUILDER', icon: '⚡', earned: progress.performance['SQL']?.correct >= 5 },
    { id: '5', name: 'BOSS DATABASE', icon: '🐉', earned: progress.answers[40] === true }
  ];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const calculateCatPercent = (cat: any) => {
    if (!cat || cat.total === 0) return 0;
    return Math.round((cat.correct / cat.total) * 100);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 overflow-auto flex justify-center items-start">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-[#111827]/90 border border-cyan-500/30 rounded-2xl p-8 backdrop-blur-md"
      >
        <div className="text-center mb-12">
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-block p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-full mb-6"
          >
            <Trophy className="w-16 h-16 text-yellow-500" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2">
            MISSÃO CONCLUÍDA
          </h1>
          <h2 className="text-2xl font-bold text-white uppercase">{progress.name}</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <div className="bg-black/50 border border-gray-800 p-6 rounded-xl text-center">
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-sm text-gray-400 mb-1">Pontuação</div>
            <div className="text-2xl font-black text-white">{progress.xp} <span className="text-sm font-normal">XP</span></div>
          </div>
          
          <div className="bg-black/50 border border-gray-800 p-6 rounded-xl text-center">
            <Target className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <div className="text-sm text-gray-400 mb-1">Nota</div>
            <div className="text-2xl font-black text-white">{note}</div>
          </div>

          <div className="bg-black/50 border border-gray-800 p-6 rounded-xl text-center">
            <BarChart className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-sm text-gray-400 mb-1">Acertos</div>
            <div className="text-2xl font-black text-white">{progress.correctCount} / {totalQuestions}</div>
          </div>

          <div className="bg-black/50 border border-gray-800 p-6 rounded-xl text-center">
            <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-sm text-gray-400 mb-1">Tempo</div>
            <div className="text-2xl font-black text-white">{formatTime(progress.duration)}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-2">
              <Award className="text-yellow-400" />
              Badges Conquistadas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {badges.map(b => b.earned && (
                <div key={b.id} className="bg-gradient-to-br from-yellow-500/20 to-yellow-900/20 border border-yellow-500/30 p-3 rounded-lg flex items-center gap-3">
                  <span className="text-2xl">{b.icon}</span>
                  <span className="font-bold text-sm text-yellow-100">{b.name}</span>
                </div>
              ))}
              {badges.filter(b => b.earned).length === 0 && (
                <div className="col-span-2 text-gray-500 text-sm">Nenhuma badge conquistada nesta missão.</div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-2">
              <BarChart className="text-cyan-400" />
              Desempenho por Área
            </h3>
            <div className="space-y-4">
              {Object.entries(progress.performance).map(([cat, data]) => {
                const percent = calculateCatPercent(data);
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 font-mono">{cat}</span>
                      <span className="text-cyan-400 font-bold">{percent}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <button 
            onClick={() => navigate('/teacher')}
            className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition"
          >
            VER RANKING
          </button>
          <button 
            onClick={() => {
              resetGame();
              navigate('/');
            }}
            className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition flex items-center gap-2"
          >
            NOVA MISSÃO <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </motion.div>
    </div>
  );
};
