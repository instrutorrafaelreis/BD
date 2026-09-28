import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { ScrambledCode } from '../components/ScrambledCode';
import { CheckCircle, Zap, Flame, Brain, HelpCircle, Code, AlignLeft, Bug, GitCommit, FileText, Link as LinkIcon, TerminalSquare, Eye, Gift } from 'lucide-react';
import type { ProgressoProva } from '../types';

const AnimatedXP = ({ xp }: { xp: number }) => {
  const [displayXp, setDisplayXp] = useState(xp);
  useEffect(() => {
    let current = displayXp;
    if (current === xp) return;
    const step = Math.max(1, Math.floor(Math.abs(xp - current) / 10));
    const interval = setInterval(() => {
      current += (xp > current ? step : -step);
      if ((xp > displayXp && current >= xp) || (xp < displayXp && current <= xp)) {
        current = xp; clearInterval(interval);
      }
      setDisplayXp(current);
    }, 50);
    return () => clearInterval(interval);
  }, [xp]);
  return <span className="font-mono">{displayXp}</span>;
};

export const Aluno: React.FC = () => {
  const { currentUser, users, provas, atividades, submissoes, addSubmissao, capacidades } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ranking'>('dashboard');
  const [activeProvaId, setActiveProvaId] = useState<string | null>(null);
  const [progresso, setProgresso] = useState<ProgressoProva | null>(null);
  
  const [answerText, setAnswerText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // Gamification State
  const [timeSpent, setTimeSpent] = useState(0);
  const [usedHint, setUsedHint] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ msg: string, score: number, isCorrect: boolean } | null>(null);

  // Bau Bonus State
  const [pendingChestOutcome, setPendingChestOutcome] = useState<any>(null); // To store the predetermined chest
  const [showChests, setShowChests] = useState(false); // To show the chest selection screen
  const [selectedChestIndex, setSelectedChestIndex] = useState<number | null>(null);

  // Association State (For DIAGRAMA_ASSOCIACAO)
  const [assocAnswers, setAssocAnswers] = useState<Record<number, string>>({});

  // Debug Challenge State
  const [debugLine, setDebugLine] = useState<number>(0);
  const [debugText, setDebugText] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const minhasSubmissoes = submissoes.filter(s => s.alunoId === currentUser?.id);
  const myTotalXP = minhasSubmissoes.reduce((acc, curr) => acc + (curr.score || 0), 0);

  const alunos = users.filter(u => u.role === 'aluno');
  const ranking = alunos.map(aluno => {
    const alunoSubmissoes = submissoes.filter(s => s.alunoId === aluno.id && s.score !== undefined);
    return { ...aluno, totalScore: alunoSubmissoes.reduce((acc, curr) => acc + (curr.score || 0), 0) };
  }).sort((a, b) => b.totalScore - a.totalScore);

  const activeProvaAtividades = atividades.filter(a => a.provaId === activeProvaId);
  const currentAtividade = progresso ? activeProvaAtividades[progresso.currentIndex] : null;

  const config = currentAtividade?.configData ? JSON.parse(currentAtividade.configData) : {};
  const isBoss = config.nivelDificuldade === 'BOSS';

  const loadProgress = async (provaId: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/progresso?alunoId=${currentUser?.id}&provaId=${provaId}`);
      const data = await res.json();
      setProgresso(data);
      setIsFinished(data.currentIndex >= activeProvaAtividades.length);
    } catch (e) { console.error(e); }
  };

  const handleStartProva = (provaId: string) => {
    setActiveProvaId(provaId);
    setAnswerText(''); setAssocAnswers({}); setDebugLine(0); setDebugText('');
    setFeedbackToast(null); setShowChests(false);
    loadProgress(provaId);
  };

  useEffect(() => {
    if (activeProvaId && currentAtividade && !feedbackToast && !showChests) {
      setTimeSpent(0); setUsedHint(false); setShowHint(false);
      setAnswerText(''); setAssocAnswers({}); setDebugLine(0); setDebugText('');
      timerRef.current = setInterval(() => setTimeSpent(p => p + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeProvaId, currentAtividade, feedbackToast, showChests]);

  const handleNextQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAtividade || !progresso) return;
    if (timerRef.current) clearInterval(timerRef.current);

    let finalAnswer = answerText;
    if (currentAtividade.type === 'MULTIPLA_ESCOLHA' || (currentAtividade.type === 'PREDICT_OUTPUT' && config.isMultipleChoice)) {
      finalAnswer = JSON.stringify({ selected: parseInt(answerText) });
    } else if (currentAtividade.type === 'COMPLETAR_CODIGO') {
      finalAnswer = JSON.stringify({ code: answerText });
    } else if (currentAtividade.type === 'COMPLETE_FRASE' || (currentAtividade.type === 'PREDICT_OUTPUT' && !config.isMultipleChoice)) {
      finalAnswer = JSON.stringify({ text: answerText });
    } else if (currentAtividade.type === 'TERMINAL_SIMULADO') {
      finalAnswer = JSON.stringify({ command: answerText });
    } else if (currentAtividade.type === 'DIAGRAMA_ASSOCIACAO') {
      // Build pairs from assocAnswers
      const pairs = config.pairs.map((p: any, i: number) => ({ left: p.left, right: assocAnswers[i] || '' }));
      finalAnswer = JSON.stringify(pairs);
    } else if (currentAtividade.type === 'DEBUG_CHALLENGE') {
      finalAnswer = JSON.stringify([{ line: debugLine, text: debugText }]);
    }

    // Predetermine chest outcome if applicable
    let chosenChest = null;
    if (config.temBauBonus && config.resultadosBau?.length > 0) {
      const randomIndex = Math.floor(Math.random() * config.resultadosBau.length);
      chosenChest = config.resultadosBau[randomIndex];
    }

    try {
      const res: any = await addSubmissao({ 
        atividadeId: currentAtividade.id, alunoId: currentUser!.id, 
        answerText: finalAnswer, timeSpent, usedHint,
        bauEscolhido: chosenChest
      });

      if (res.isCorrect && config.temBauBonus) {
        setPendingChestOutcome({ ...res, chosenChest });
        setShowChests(true); // Switch to chest picking UI
      } else {
        showFinalFeedback(res);
      }
    } catch (err) { alert(err); }
  };

  const showFinalFeedback = (res: any) => {
    setFeedbackToast({ msg: res.submissao.feedback, score: res.submissao.score, isCorrect: res.isCorrect });
    setProgresso(res.progresso);
    setTimeout(() => {
      setFeedbackToast(null); setShowChests(false); setSelectedChestIndex(null);
      if (res.progresso.currentIndex >= activeProvaAtividades.length) setIsFinished(true);
    }, 3000);
  };

  const handleChestPick = (index: number) => {
    setSelectedChestIndex(index);
    setTimeout(() => {
      showFinalFeedback(pendingChestOutcome);
    }, 1500);
  };

  const getCapacidadePerformance = () => {
    if (!activeProvaId) return [];
    const perfMap: Record<string, { total: number, earned: number }> = {};
    activeProvaAtividades.forEach(ativ => {
      const sub = submissoes.find(s => s.atividadeId === ativ.id && s.alunoId === currentUser?.id);
      const maxPossible = (ativ.configData ? JSON.parse(ativ.configData).xpBase : 100) || 100;
      ativ.capacidadeIds.forEach(capId => {
        if (!perfMap[capId]) perfMap[capId] = { total: 0, earned: 0 };
        perfMap[capId].total += maxPossible;
        if (sub && sub.score) perfMap[capId].earned += sub.score;
      });
    });
    return Object.keys(perfMap).map(capId => {
      const cap = capacidades.find(c => c.id === capId);
      return { name: cap?.name || 'Desconhecido', percent: perfMap[capId].total > 0 ? Math.round((perfMap[capId].earned / perfMap[capId].total) * 100) : 0 };
    });
  };

  if (activeProvaId && progresso) {
    if (isFinished) {
      const performance = getCapacidadePerformance();
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="relative"><CheckCircle className="w-24 h-24 text-green-500 relative z-10" /><div className="absolute inset-0 bg-green-500 blur-3xl opacity-20 z-0 rounded-full animate-pulse"></div></div>
          <h1 className="text-4xl font-black text-white">Missão Concluída!</h1>
          <div className="bg-[#1a2235] p-8 rounded-2xl border border-gray-800 w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-center text-blue-400 mb-6">Seu Desempenho (Radar)</h2>
            <div className="space-y-4">
              {performance.map(p => (
                <div key={p.name}>
                  <div className="flex justify-between text-sm mb-1"><span className="text-gray-300 font-semibold">{p.name}</span><span className="text-blue-400 font-bold">{p.percent}%</span></div>
                  <div className="w-full bg-gray-800 rounded-full h-3"><div className="bg-blue-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${p.percent}%` }}></div></div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => { setActiveProvaId(null); setProgresso(null); setIsFinished(false); }} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Voltar ao QG</button>
        </div>
      );
    }

    if (!currentAtividade) return null;

    const limit = config.segundosLimite || 60;
    const energyPercent = Math.max(0, 100 - (timeSpent / limit) * 100);

    // Dynamic Icon
    let QIcon = HelpCircle;
    if (currentAtividade.type === 'COMPLETAR_CODIGO') QIcon = Code;
    else if (currentAtividade.type === 'CODIGO_EMBARALHADO') QIcon = AlignLeft;
    else if (currentAtividade.type === 'SEQUENCIA_LOGICA') QIcon = GitCommit;
    else if (currentAtividade.type === 'DEBUG_CHALLENGE') QIcon = Bug;
    else if (currentAtividade.type === 'COMPLETE_FRASE') QIcon = FileText;
    else if (currentAtividade.type === 'DIAGRAMA_ASSOCIACAO') QIcon = LinkIcon;
    else if (currentAtividade.type === 'PREDICT_OUTPUT') QIcon = Eye;
    else if (currentAtividade.type === 'TERMINAL_SIMULADO') QIcon = TerminalSquare;

    return (
      <div className="w-full max-w-4xl mx-auto relative min-h-[80vh]">
        <div className="flex flex-col gap-4 mb-8 bg-[#1a2235] p-4 rounded-xl border border-gray-800 shadow-lg sticky top-4 z-40">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-gray-900 px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-2">
                <Zap className="text-yellow-400 w-5 h-5" />
                <span className="text-xl font-black text-white"><AnimatedXP xp={progresso.xpAccumulated} /> XP</span>
              </div>
              {progresso.streak >= 2 && (
                <div className="bg-orange-900/30 px-3 py-1.5 rounded-lg border border-orange-500/50 flex items-center gap-2">
                  <Flame className="text-orange-500 w-5 h-5 animate-pulse" />
                  <span className="text-orange-400 font-bold">{progresso.streak}x Streak!</span>
                </div>
              )}
            </div>
            <button onClick={() => { setActiveProvaId(null); setProgresso(null); }} className="text-gray-500 hover:text-red-400 font-semibold text-sm">Pausar Prova</button>
          </div>
          <div className="flex items-center gap-2">
            {activeProvaAtividades.map((_, idx) => (
              <div key={idx} className={`flex-1 h-2 rounded-full transition-all duration-500 ${idx < progresso.currentIndex ? 'bg-blue-500' : idx === progresso.currentIndex ? 'bg-yellow-400 animate-pulse' : 'bg-gray-800'}`} />
            ))}
          </div>
          {config.temTimer && (
            <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
              <div className={`h-full transition-all duration-1000 ${energyPercent > 50 ? 'bg-green-500' : energyPercent > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${energyPercent}%` }} />
            </div>
          )}
        </div>

        {/* CHEST MINIGAME */}
        {showChests && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0f19]/90 backdrop-blur-md rounded-2xl animate-in fade-in">
            <h2 className="text-4xl font-black text-yellow-400 mb-2">Desafio Superado!</h2>
            <p className="text-gray-300 mb-12 text-lg">Escolha um Baú de Recompensa:</p>
            
            <div className="flex gap-8">
              {[0, 1, 2].map(i => {
                const isSelected = selectedChestIndex === i;
                const isRevealed = selectedChestIndex !== null;
                const isWinner = isRevealed && isSelected;
                
                return (
                  <button 
                    key={i} onClick={() => !isRevealed && handleChestPick(i)} disabled={isRevealed}
                    className={`relative p-8 rounded-2xl border-4 transition-all duration-500 ${isRevealed && !isSelected ? 'opacity-30 scale-90 border-gray-800' : isSelected ? 'border-yellow-400 bg-yellow-900/40 scale-110 shadow-[0_0_30px_rgba(250,204,21,0.5)]' : 'border-gray-700 bg-gray-800 hover:border-yellow-500/50 hover:scale-105 hover:bg-gray-700'} group`}
                  >
                    <Gift className={`w-20 h-20 mx-auto ${isSelected ? 'text-yellow-400' : 'text-gray-500 group-hover:text-yellow-500/50'}`} />
                    {isWinner && pendingChestOutcome?.chosenChest && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-yellow-400 text-black px-4 py-1 rounded-full font-black text-sm animate-in slide-in-from-bottom">
                        {pendingChestOutcome.chosenChest.tipo === 'DOBRAR_XP' ? '2x XP!' : pendingChestOutcome.chosenChest.tipo === 'XP_FIXO' ? `+${pendingChestOutcome.chosenChest.valor} XP!` : 'Perdeu Metade ☠️'}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* FEEDBACK OVERLAY */}
        {feedbackToast && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl animate-in fade-in zoom-in duration-300">
            <div className={`p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-sm ${feedbackToast.isCorrect ? 'bg-green-900/80 border-2 border-green-500' : 'bg-red-900/80 border-2 border-red-500'}`}>
              {feedbackToast.isCorrect ? <CheckCircle className="w-16 h-16 text-green-400 mb-4" /> : <Flame className="w-16 h-16 text-red-400 mb-4" />}
              <h2 className="text-2xl font-black text-white mb-2">{feedbackToast.msg}</h2>
              {feedbackToast.score > 0 && <p className="text-3xl font-black text-yellow-400">+{feedbackToast.score} XP</p>}
            </div>
          </div>
        )}

        {/* QUESTION CONTENT */}
        <div className={`transition-all duration-500 ${(feedbackToast || showChests) ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100'} bg-[#111827] border ${isBoss ? 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : 'border-gray-800'} rounded-2xl p-6 md:p-8`}>
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-3 rounded-xl ${isBoss ? 'bg-yellow-900/30 text-yellow-400' : 'bg-blue-900/30 text-blue-400'}`}><QIcon className="w-8 h-8" /></div>
            <div>
              {isBoss && <p className="text-xs text-yellow-500 font-black uppercase mb-1">Boss Challenge</p>}
              <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">{currentAtividade.title}</h3>
            </div>
          </div>
          <p className="text-gray-300 mb-8 text-lg">{currentAtividade.description}</p>

          <form onSubmit={handleNextQuestion} className="space-y-6">
            
            {/* RENDER BY TYPE */}
            {currentAtividade.type === 'UPLOAD' && (
              <textarea placeholder="Sua resposta..." value={answerText} onChange={e => setAnswerText(e.target.value)} rows={5} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white text-lg focus:border-blue-500" required></textarea>
            )}

            {(currentAtividade.type === 'MULTIPLA_ESCOLHA' || (currentAtividade.type === 'PREDICT_OUTPUT' && config.isMultipleChoice)) && config.options && (
              <div className="space-y-3">
                {config.options.map((opt: string, i: number) => (
                  <label key={i} className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer border-2 transition-all ${answerText === String(i) ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-gray-800/50'}`}>
                    <input type="radio" value={i} checked={answerText === String(i)} onChange={e => setAnswerText(e.target.value)} className="w-5 h-5" required />
                    <span className="text-white text-lg">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {currentAtividade.type === 'COMPLETAR_CODIGO' && (
              <textarea placeholder="Código..." value={answerText} onChange={e => setAnswerText(e.target.value)} rows={6} className="w-full bg-[#0d1117] border border-gray-700 rounded-lg p-4 text-green-400 font-mono text-lg" required></textarea>
            )}

            {(currentAtividade.type === 'CODIGO_EMBARALHADO' || currentAtividade.type === 'SEQUENCIA_LOGICA') && config.lines && (
              <ScrambledCode correctLines={config.lines} onChange={(ordered) => setAnswerText(JSON.stringify(ordered))} />
            )}

            {(currentAtividade.type === 'COMPLETE_FRASE' || (currentAtividade.type === 'PREDICT_OUTPUT' && !config.isMultipleChoice)) && (
              <input type="text" placeholder="Digite a resposta curta exata..." value={answerText} onChange={e => setAnswerText(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white text-lg focus:border-blue-500" required />
            )}

            {currentAtividade.type === 'TERMINAL_SIMULADO' && (
              <div className="flex bg-[#0d1117] border border-gray-700 rounded-lg p-4 items-center">
                <span className="text-green-500 font-mono text-lg mr-2">user@sh:~$</span>
                <input type="text" value={answerText} onChange={e => setAnswerText(e.target.value)} className="flex-1 bg-transparent text-white font-mono text-lg outline-none" required />
              </div>
            )}

            {currentAtividade.type === 'DEBUG_CHALLENGE' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">Insira o número da linha que contém o erro e o código corrigido.</p>
                <div className="flex gap-4">
                  <input type="number" placeholder="Linha" value={debugLine} onChange={e => setDebugLine(Number(e.target.value))} className="w-24 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-lg" required />
                  <input type="text" placeholder="Código Corrigido" value={debugText} onChange={e => setDebugText(e.target.value)} className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 font-mono text-green-400 text-lg" required />
                </div>
              </div>
            )}

            {currentAtividade.type === 'DIAGRAMA_ASSOCIACAO' && config.pairs && (
              <div className="space-y-4">
                {config.pairs.map((p: any, i: number) => (
                  <div key={i} className="flex flex-col md:flex-row items-center gap-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="w-full md:w-1/2 p-3 bg-gray-900 rounded text-white text-center font-bold">{p.left}</div>
                    <LinkIcon className="text-gray-500 w-6 h-6 rotate-90 md:rotate-0" />
                    <select value={assocAnswers[i] || ''} onChange={e => setAssocAnswers({...assocAnswers, [i]: e.target.value})} className="w-full md:w-1/2 p-3 bg-gray-900 text-white rounded border border-gray-600" required>
                      <option value="">Selecione...</option>
                      {/* Shuffle right options randomly based on the original pairs */}
                      {[...config.pairs].sort((a,b) => a.right.localeCompare(b.right)).map((opt: any, j: number) => (
                        <option key={j} value={opt.right}>{opt.right}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-6 border-t border-gray-800 mt-8">
              <div>
                {config.dicaDisponivel && !showHint && (
                  <button type="button" onClick={() => { setShowHint(true); setUsedHint(true); }} className="text-sm text-yellow-500 font-bold hover:text-yellow-400 flex items-center gap-1"><HelpCircle className="w-4 h-4" /> Pedir Dica (-{config.custoXpDica} XP)</button>
                )}
                {showHint && <div className="text-sm text-gray-300 bg-gray-900 p-3 rounded-lg border border-gray-700 max-w-sm"><span className="text-yellow-500 font-bold">Dica:</span> {config.textoDica}</div>}
              </div>
              <button type="submit" className={`px-8 py-3 rounded-lg text-white font-black hover:scale-105 transition-all shadow-lg ${isBoss ? 'bg-yellow-600 hover:bg-yellow-500 text-yellow-950' : 'bg-blue-600 hover:bg-blue-500'}`}>
                Confirmar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard rendering remains exactly the same logic
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div><h1 className="text-3xl font-bold text-blue-400">Área do Aluno</h1></div>
        <div className="bg-blue-900/40 border border-blue-500/50 px-6 py-3 rounded-lg text-center"><p className="text-sm text-blue-300 font-bold">Seu XP Total</p><p className="text-4xl font-black text-white"><AnimatedXP xp={myTotalXP} /></p></div>
      </div>
      <div className="flex gap-4 border-b border-gray-800 pb-2">
        <button className={`pb-2 px-4 ${activeTab === 'dashboard' ? 'border-b-2 border-blue-500 text-white font-bold' : 'text-gray-500'}`} onClick={() => setActiveTab('dashboard')}>Missões</button>
        <button className={`pb-2 px-4 ${activeTab === 'ranking' ? 'border-b-2 border-blue-500 text-white font-bold' : 'text-gray-500'}`} onClick={() => setActiveTab('ranking')}>Ranking</button>
      </div>
      {activeTab === 'dashboard' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Missões Abertas</h2>
            {provas.filter(p => p.ativa).map(prova => {
              const pAtivs = atividades.filter(a => a.provaId === prova.id);
              if (pAtivs.length === 0) return null;
              const completed = pAtivs.filter(a => minhasSubmissoes.some(s => s.atividadeId === a.id)).length;
              if (completed >= pAtivs.length) return null;
              return (
                <div key={prova.id} className="bg-[#1a2235] p-6 rounded-xl border border-gray-800 flex flex-col justify-between group">
                  <div>
                    <h3 className="text-xl font-bold text-blue-400 mb-2">{prova.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{prova.description}</p>
                  </div>
                  <button onClick={() => handleStartProva(prova.id)} className="w-full bg-blue-600 py-3 rounded-lg text-white font-bold hover:bg-blue-500">
                    {completed > 0 ? 'Retomar' : 'Iniciar'}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Concluídas</h2>
            {provas.filter(p => p.ativa).map(prova => {
              const pAtivs = atividades.filter(a => a.provaId === prova.id);
              if (pAtivs.length === 0) return null;
              const completed = pAtivs.filter(a => minhasSubmissoes.some(s => s.atividadeId === a.id)).length;
              if (completed < pAtivs.length) return null;
              return (
                <div key={prova.id} className="bg-green-900/10 p-6 rounded-xl border border-green-500/20">
                  <h3 className="text-xl font-bold text-green-400 mb-2">{prova.title}</h3>
                  <button onClick={() => { setActiveProvaId(prova.id); setIsFinished(true); loadProgress(prova.id); }} className="text-sm text-green-500 font-bold hover:underline">Ver Relatório</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {activeTab === 'ranking' && (
        <div className="bg-[#1a2235] p-6 rounded-xl border border-gray-800 max-w-2xl mx-auto">
          <div className="text-center mb-8"><Flame className="w-12 h-12 text-orange-500 mx-auto mb-2" /><h2 className="text-3xl font-black text-white">Hall da Fama</h2></div>
          <div className="space-y-4">
            {ranking.map((aluno, index) => (
              <div key={aluno.id} className={`flex justify-between items-center p-4 rounded-xl border ${aluno.id === currentUser?.id ? 'bg-blue-900/30 border-blue-500' : 'bg-gray-900/50 border-gray-800'}`}>
                <div className="flex items-center gap-4">
                  <span className={`text-3xl font-black ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-gray-600'}`}>{index + 1}º</span>
                  <div>
                    <span className="font-bold text-lg text-white block">{aluno.name}</span>
                    {aluno.id === currentUser?.id && <span className="text-xs text-blue-400 font-bold uppercase">Você</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-blue-400 font-black text-2xl"><AnimatedXP xp={aluno.totalScore} /></span>
                  <span className="text-blue-500/70 text-sm ml-1 font-bold">XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
