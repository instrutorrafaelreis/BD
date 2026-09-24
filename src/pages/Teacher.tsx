import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Download, Trophy, Users, Star, Clock, Home, BookOpen, AlertTriangle } from 'lucide-react';
import { questions } from '../data/questions';

export const Teacher = () => {
  const [auth, setAuth] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('bd_challenge_users') || '[]');
    // Sort by XP (desc), then Time (asc)
    data.sort((a: any, b: any) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      return a.duration - b.duration;
    });
    setUsers(data);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '2026') {
      setAuth(true);
      setError(false);
    } else {
      setError(true);
      setPin('');
    }
  };

  const exportCSV = () => {
    let csv = 'Posicao,Nome,Turma,Pontuacao,Nota,Acertos,Tempo(s),Fundamentos,Conceitual,Logico,Tipos,SQL,Integracao\n';
    users.forEach((u, i) => {
      const nota = (u.percentage / 10).toFixed(1);
      
      const getCatP = (cat: string) => {
        const c = u.performance[cat];
        if (!c || c.total === 0) return 0;
        return Math.round((c.correct / c.total) * 100);
      };

      csv += `${i + 1},${u.name},${u.turma},${u.xp},${nota},${u.correctCount},${u.duration},${getCatP('FUNDAMENTOS')},${getCatP('CONCEITUAL')},${getCatP('LÓGICO')},${getCatP('TIPOS')},${getCatP('SQL')},${getCatP('INTEGRAÇÃO')}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ranking_bd_challenge.csv';
    link.click();
  };

  if (!auth) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center p-4">
        <div className="bg-[#111827] border border-gray-800 p-8 rounded-2xl w-full max-w-md text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-gray-400 mb-8">Painel exclusivo do professor.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Digite o PIN"
              className={`w-full bg-black/50 border ${error ? 'border-red-500' : 'border-gray-700'} rounded-lg p-4 text-center text-2xl tracking-[1em] font-mono outline-none focus:border-cyan-500`}
              autoFocus
            />
            {error && <p className="text-red-500 text-sm">PIN Incorreto</p>}
            <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-lg transition">
              AUTENTICAR
            </button>
            <button type="button" onClick={() => navigate('/')} className="w-full text-gray-500 hover:text-white pt-4 transition text-sm">
              Voltar para Início
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Analytics
  const avgXp = users.length > 0 ? Math.round(users.reduce((acc, u) => acc + u.xp, 0) / users.length) : 0;
  const avgTime = users.length > 0 ? Math.round(users.reduce((acc, u) => acc + u.duration, 0) / users.length) : 0;
  
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Questões Status
  const questionStats = questions.map(q => {
    let correct = 0;
    let wrong = 0;
    users.forEach(u => {
      if (u.answers && u.answers[q.id] === true) correct++;
      else if (u.answers && u.answers[q.id] === false) wrong++;
    });
    const total = correct + wrong;
    const errorRate = total > 0 ? Math.round((wrong / total) * 100) : 0;
    const correctRate = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    // Determine the text answer if possible
    let answerText = 'Ver sistema';
    if (q.type === 'multiple_choice') answerText = q.options[q.correctOption];
    if (q.type === 'sql_complete') answerText = q.expectedWord;
    if (q.type === 'sql_input') answerText = q.expectedQuery[0];
    if (q.type === 'drag_drop_blocks') answerText = 'Ordem correta';
    if (q.type === 'drag_drop_relationship') answerText = q.correctSequence.join(' - ');

    return { ...q, correct, wrong, total, errorRate, correctRate, answerText };
  });

  const hardestQuestions = [...questionStats]
    .filter(q => q.total > 0)
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 3);

  if (fullscreen) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] p-8 flex flex-col">
        <div className="text-center mb-8 relative">
          <button onClick={() => setFullscreen(false)} className="absolute left-0 top-0 p-2 text-gray-500 hover:text-white">Sair</button>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            BANCO DE DADOS CHALLENGE
          </h1>
          <h2 className="text-3xl font-bold text-yellow-400 mt-2">🏆 RANKING AO VIVO</h2>
        </div>
        
        <div className="flex-1 max-w-5xl w-full mx-auto space-y-4">
          {users.map((u, i) => (
            <div key={i} className={`flex items-center justify-between p-6 rounded-xl border ${i === 0 ? 'bg-yellow-500/20 border-yellow-500/50 scale-105 shadow-[0_0_30px_rgba(255,215,0,0.2)]' : i === 1 ? 'bg-gray-300/10 border-gray-400/50' : i === 2 ? 'bg-orange-900/30 border-orange-700/50' : 'bg-[#111827] border-gray-800'} transition-all`}>
              <div className="flex items-center gap-6">
                <span className={`text-4xl font-black ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-500' : 'text-gray-600'}`}>
                  {i + 1}º
                </span>
                <div>
                  <h3 className="text-2xl font-bold text-white uppercase">{u.name}</h3>
                  <span className="text-sm text-gray-400">{u.turma}</span>
                </div>
              </div>
              <div className="flex items-center gap-8 text-right">
                <div>
                  <div className="text-sm text-gray-400">XP</div>
                  <div className="text-2xl font-black text-cyan-400">{u.xp}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Tempo</div>
                  <div className="text-xl font-mono text-white">{formatTime(u.duration)}</div>
                </div>
              </div>
            </div>
          ))}
          {users.length === 0 && <div className="text-center text-gray-500 py-10">Nenhum aluno finalizou ainda.</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111827] p-6 rounded-2xl border border-gray-800">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="text-red-500" />
              Painel do Professor
            </h1>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/')} className="px-4 py-2 border border-gray-700 rounded-lg text-sm hover:bg-gray-800 flex items-center gap-2">
              <Home className="w-4 h-4" /> Início
            </button>
            <button onClick={() => setFullscreen(true)} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg text-sm flex items-center gap-2 transition">
              <Trophy className="w-4 h-4" /> MODO TELÃO
            </button>
            <button onClick={exportCSV} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-sm flex items-center gap-2 transition">
              <Download className="w-4 h-4" /> EXPORTAR CSV
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-[#111827] border border-gray-800 p-6 rounded-xl">
            <Users className="w-6 h-6 text-cyan-400 mb-2" />
            <div className="text-sm text-gray-400 mb-1">Total Finalizados</div>
            <div className="text-3xl font-black text-white">{users.length}</div>
          </div>
          <div className="bg-[#111827] border border-gray-800 p-6 rounded-xl">
            <Star className="w-6 h-6 text-yellow-400 mb-2" />
            <div className="text-sm text-gray-400 mb-1">Média XP</div>
            <div className="text-3xl font-black text-white">{avgXp}</div>
          </div>
          <div className="bg-[#111827] border border-gray-800 p-6 rounded-xl">
            <Clock className="w-6 h-6 text-blue-400 mb-2" />
            <div className="text-sm text-gray-400 mb-1">Tempo Médio</div>
            <div className="text-3xl font-black text-white">{formatTime(avgTime)}</div>
          </div>
        </div>

        {/* Questões com Mais Dificuldade */}
        {users.length > 0 && (
          <div className="bg-[#111827] border border-red-900/50 p-6 rounded-2xl">
            <h2 className="text-xl font-bold flex items-center gap-2 text-red-400 mb-6">
              <AlertTriangle className="w-5 h-5" />
              Questões com Mais Dificuldade
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {hardestQuestions.map(hq => (
                <div key={hq.id} className="bg-black/50 border border-red-900/50 p-4 rounded-xl">
                  <div className="text-red-400 font-bold mb-1">Questão {hq.id}</div>
                  <div className="text-2xl font-black text-white">{hq.errorRate}% erraram</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ranking */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Ranking Completo
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/50 text-gray-400">
                <tr>
                  <th className="p-4">Pos</th>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Turma</th>
                  <th className="p-4">XP</th>
                  <th className="p-4">Nota</th>
                  <th className="p-4">Tempo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((u, i) => (
                  <tr key={i} className="hover:bg-gray-800/50">
                    <td className="p-4 font-bold text-gray-500">{i + 1}º</td>
                    <td className="p-4 font-bold text-white uppercase">{u.name}</td>
                    <td className="p-4 text-gray-400">{u.turma}</td>
                    <td className="p-4 font-mono text-cyan-400">{u.xp}</td>
                    <td className="p-4 font-mono text-green-400">{(u.percentage / 10).toFixed(1)}</td>
                    <td className="p-4 font-mono text-gray-300">{formatTime(u.duration)}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">Nenhum aluno finalizou ainda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gabarito */}
        <div className="bg-[#111827] border border-cyan-900/30 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold flex items-center gap-2 text-cyan-400">
              <BookOpen className="w-5 h-5" />
              Gabarito e Estatísticas por Questão
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/50 text-gray-400">
                <tr>
                  <th className="p-4">Q</th>
                  <th className="p-4 min-w-[200px]">Enunciado Resumido</th>
                  <th className="p-4">Resposta Correta</th>
                  <th className="p-4 text-center">Acertos</th>
                  <th className="p-4 text-center">Erros</th>
                  <th className="p-4 text-center">% Acerto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {questionStats.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-800/50">
                    <td className="p-4 font-mono text-gray-500">{q.id}</td>
                    <td className="p-4 text-gray-300 truncate max-w-xs" title={q.text}>
                      {q.text.split('\n')[0]}
                    </td>
                    <td className="p-4 text-cyan-400 text-xs">
                      {q.answerText}
                    </td>
                    <td className="p-4 text-center font-bold text-green-400">{q.correct}</td>
                    <td className="p-4 text-center font-bold text-red-400">{q.wrong}</td>
                    <td className="p-4 text-center font-mono">
                      <span className={q.correctRate < 50 ? 'text-red-400' : 'text-green-400'}>
                        {q.correctRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
