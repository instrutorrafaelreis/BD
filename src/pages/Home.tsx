import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Database, User, BookOpen, ChevronRight, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export const Home = () => {
  const [name, setName] = useState('');
  const [turma, setTurma] = useState('');
  const { startGame } = useGame();
  const navigate = useNavigate();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && turma.trim()) {
      startGame(name, turma);
      navigate('/game');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center relative bg-[#0a0f1d] overflow-hidden p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-[var(--color-brand-cyan)] rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-64 h-64 bg-[var(--color-brand-turquoise)] rounded-full blur-[100px]" />
      </div>

      <div className="z-10 w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="inline-block p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mb-4">
            <Database className="w-12 h-12 text-[var(--color-brand-cyan)]" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
              BANCO DE DADOS
            </span>
            <br />
            CHALLENGE
          </h1>

          <div className="flex gap-4 font-mono text-sm tracking-widest text-cyan-500/80 font-bold">
            <span>PENSE.</span>
            <span>MODELE.</span>
            <span>RELACIONE.</span>
            <span>PROGRAME.</span>
          </div>

          <p className="text-xl text-gray-400 font-light border-l-2 border-cyan-500 pl-4 py-1">
            "Do mundo real ao Banco de Dados"
          </p>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-[#111827]/80 border border-gray-800 p-4 rounded-xl flex flex-col items-center justify-center gap-2">
              <span className="text-3xl font-black text-white">40</span>
              <span className="text-xs text-gray-400 tracking-wider">QUESTÕES</span>
            </div>
            <div className="bg-[#111827]/80 border border-gray-800 p-4 rounded-xl text-sm text-gray-300 flex flex-col gap-1 justify-center">
              <div>• SQL</div>
              <div>• DIAGRAMAS</div>
              <div>• CAÇA-ERROS</div>
              <div>• BOSS FINAL</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111827]/90 border border-cyan-500/30 p-8 rounded-2xl backdrop-blur-sm relative"
        >
          <div className="absolute -top-3 -right-3">
            <button onClick={() => navigate('/teacher')} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition" title="Painel do Professor">
              <ShieldAlert className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <User className="text-cyan-400" />
            Identificação
          </h2>

          <form onSubmit={handleStart} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400 ml-1">Nome completo</label>
              <input 
                required
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-black/50 border border-gray-700 focus:border-cyan-500 rounded-lg p-4 text-white outline-none transition"
                placeholder="Ex: João da Silva"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 ml-1">Turma</label>
              <input 
                required
                type="text" 
                value={turma}
                onChange={e => setTurma(e.target.value)}
                className="w-full bg-black/50 border border-gray-700 focus:border-cyan-500 rounded-lg p-4 text-white outline-none transition"
                placeholder="Ex: TDS12"
              />
            </div>

            <button 
              type="submit"
              disabled={!name.trim() || !turma.trim()}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition glow-cyan mt-4"
            >
              INICIAR MISSÃO
              <ChevronRight />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
