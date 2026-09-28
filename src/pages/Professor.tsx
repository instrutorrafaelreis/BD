import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Sparkles, HelpCircle, Zap, ChevronDown, ChevronRight, Upload, List, Code, AlignLeft, Bug, GitCommit, FileText, Link, TerminalSquare, Eye, Gift } from 'lucide-react';
import { Navigation } from '../components/Navigation';

const QUESTION_TYPES = [
  { id: 'UPLOAD', title: 'Padrão (Envio)', icon: Upload, desc: 'Envio de arquivo ou texto livre.', cat: 'Geral' },
  { id: 'MULTIPLA_ESCOLHA', title: 'Múltipla Escolha', icon: List, desc: 'Clássico teste de alternativas.', cat: 'Geral' },
  { id: 'COMPLETAR_CODIGO', title: 'Completar Código', icon: Code, desc: 'Aluno preenche o trecho faltante.', cat: 'Tecnologia' },
  { id: 'CODIGO_EMBARALHADO', title: 'Embaralhado', icon: AlignLeft, desc: 'Drag & Drop de linhas de código.', cat: 'Tecnologia' },
  { id: 'DEBUG_CHALLENGE', title: 'Debug Challenge', icon: Bug, desc: 'Achar o bug e corrigir a linha.', cat: 'Tecnologia' },
  { id: 'SEQUENCIA_LOGICA', title: 'Seq. Lógica', icon: GitCommit, desc: 'Ordenar passos lógicos.', cat: 'Gestão' },
  { id: 'COMPLETE_FRASE', title: 'Complete a Frase', icon: FileText, desc: 'Preencher lacunas em conceito.', cat: 'Geral' },
  { id: 'DIAGRAMA_ASSOCIACAO', title: 'Associação', icon: Link, desc: 'Ligar colunas de conceitos.', cat: 'Gestão' },
  { id: 'PREDICT_OUTPUT', title: 'Prever Saída', icon: Eye, desc: 'O que o código imprime?', cat: 'Tecnologia' },
  { id: 'TERMINAL_SIMULADO', title: 'Terminal', icon: TerminalSquare, desc: 'Digitar comando esperado.', cat: 'Tecnologia' },
];

export type GrupoPrincipal = 'provas' | 'turmas' | 'avaliacao';
export type SubAba = 'nova_prova' | 'todas_avaliacoes' | 'lancar_atividade' | 'turmas' | 'cadastrar_alunos' | 'avaliar' | 'ranking';

const ModalVerQuestoes: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  prova: any;
  atividades: any[];
}> = ({ isOpen, onClose, prova, atividades }) => {
  if (!isOpen || !prova) return null;

  const questoes = atividades.filter(a => a.provaId === prova.id);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#1a2235] border border-blue-500/30 rounded-xl p-6 w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Questões da Avaliação</h3>
            <p className="text-sm text-blue-400 mt-1">{prova.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">
            X
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {questoes.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-700 rounded-lg">
              <p className="text-gray-500">Ainda não há questões cadastradas nesta avaliação.</p>
            </div>
          ) : (
            questoes.map((q, idx) => (
              <div key={q.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-900/40 text-blue-400 font-bold rounded flex items-center justify-center border border-blue-500/30">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded border border-purple-500/30">
                      {q.tipo}
                    </span>
                  </div>
                  <h4 className="text-white font-bold text-sm mb-1">{q.title}</h4>
                  <p className="text-gray-400 text-xs line-clamp-2">{q.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-800 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 text-sm font-bold">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

const ModalNovoAluno: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (aluno: { id: string; name: string; email: string }) => void;
  registerUser: any;
}> = ({ isOpen, onClose, onSuccess, registerUser }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#1a2235] border border-green-500/30 rounded-xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold text-white mb-4">Cadastrar Novo Aluno</h3>
        {erro && <div className="text-red-400 bg-red-900/20 p-2 rounded mb-3 text-sm">{erro}</div>}
        <input type="text" placeholder="Nome completo" value={nome} onChange={e => setNome(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-3" />
        <input type="text" placeholder="E-mail (será o login)" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-4" />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 text-gray-400 hover:text-white text-sm">Cancelar</button>
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              if (!nome || !email) return setErro("Preencha nome e e-mail.");
              setLoading(true); setErro('');
              try {
                const res = await fetch('http://localhost:3001/api/users', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: nome, username: email, role: 'aluno', password: 'mudar123', senhaTemporaria: true })
                });
                if (!res.ok) throw new Error('E-mail já em uso ou erro no servidor');
                const aluno = await res.json();
                onSuccess({ id: aluno.id, name: aluno.name, email: aluno.username });
                setNome(''); setEmail('');
              } catch (err: any) {
                setErro(err.message || "Erro ao cadastrar aluno. E-mail já em uso?");
              } finally {
                setLoading(false);
              }
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold text-sm disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Cadastrar e Adicionar'}
          </button>
        </div>
      </div>
    </div>
  );
};


const SeletorDeAlunos: React.FC<{
  alunosSelecionados: { id: string; name: string; email: string }[];
  setAlunosSelecionados: (alunos: { id: string; name: string; email: string }[]) => void;
  users: any[];
  registerUser: any;
}> = ({ alunosSelecionados, setAlunosSelecionados, users, registerUser }) => {
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <div className="bg-[#1a2235] border border-gray-700 p-3 rounded">
      <div className="flex flex-col gap-3">
        <label className="block text-sm text-gray-400">Buscar e Selecionar Alunos</label>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar aluno por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white pr-20"
          />
          <button
            type="button"
            onClick={() => setModalAberto(true)}
            className="absolute right-1 top-1 bottom-1 bg-green-600 hover:bg-green-500 px-3 rounded text-xs font-bold text-white flex items-center"
          >
            + Novo
          </button>
        </div>

        {busca.trim() && (
          <div className="border border-gray-700 rounded max-h-40 overflow-y-auto bg-gray-900">
            {users
              .filter(u => u.role === 'aluno' && u.name.toLowerCase().includes(busca.toLowerCase()))
              .map(u => {
                const jaSelecionado = alunosSelecionados.some(s => s.id === u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      if (!jaSelecionado) {
                        setAlunosSelecionados([...alunosSelecionados, { id: u.id, name: u.name, email: u.username }]);
                      }
                      setBusca('');
                    }}
                    className={`w-full text-left p-2 hover:bg-gray-800 text-sm ${jaSelecionado ? 'text-gray-500' : 'text-gray-300'}`}
                    disabled={jaSelecionado}
                  >
                    {u.name} ({u.username}) {jaSelecionado && '✓'}
                  </button>
                );
              })}
          </div>
        )}

        {alunosSelecionados.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {alunosSelecionados.map(aluno => (
              <div key={aluno.id} className="bg-blue-900/30 border border-blue-500/30 px-2 py-1 rounded flex items-center gap-2">
                <span className="text-sm text-blue-300">{aluno.name}</span>
                <button
                  type="button"
                  onClick={() => setAlunosSelecionados(alunosSelecionados.filter(a => a.id !== aluno.id))}
                  className="text-blue-500 hover:text-red-400 font-bold px-1"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ModalNovoAluno 
        isOpen={modalAberto} 
        onClose={() => setModalAberto(false)}
        onSuccess={(novo) => {
          setAlunosSelecionados([...alunosSelecionados, novo]);
          setModalAberto(false);
        }}
        registerUser={registerUser}
      />
    </div>
  );
};

export const Professor: React.FC = () => {
  const { currentUser, users, cursos, turmas, categorias, provas, atividades, conhecimentos, capacidades, submissoes, logout, addProva, addAtividade, addTurma, deleteTurma, uploadAlunos, vincularAlunos, registerUser, clonarProva, toggleProvaAtiva, atualizarPinProva } = useAppContext();
  const [grupoAtivo, setGrupoAtivo] = useState<GrupoPrincipal>('provas');
  const [subAbaAtiva, setSubAbaAtiva] = useState<SubAba>('nova_prova');
  
  const handleGrupoClick = (grupo: GrupoPrincipal) => {
    setGrupoAtivo(grupo);
    if (grupo === 'provas') setSubAbaAtiva('nova_prova');
    else if (grupo === 'turmas') setSubAbaAtiva('turmas');
    else if (grupo === 'avaliacao') setSubAbaAtiva('avaliar');
  };
    
  const [provaTitle, setProvaTitle] = useState('');
  const [provaDesc, setProvaDesc] = useState('');
  const [provaAtiva, setProvaAtiva] = useState(false);
  const [provaPin, setProvaPin] = useState('');
  const [pinEditandoId, setPinEditandoId] = useState<string | null>(null);
  const [pinEditandoValor, setPinEditandoValor] = useState('');
  const [buscaProvas, setBuscaProvas] = useState('');
  const [provaVisualizacaoId, setProvaVisualizacaoId] = useState<string | null>(null);
  const gerarPinAleatorio = (): string => String(Math.floor(1000 + Math.random() * 9000));
  const [provaCursoId, setProvaCursoId] = useState('');
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('');
  const [modalAtribuirProvaId, setModalAtribuirProvaId] = useState<string | null>(null);
  const [modalAtribuirTurmaId, setModalAtribuirTurmaId] = useState<string>('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [provaId, setProvaId] = useState('');
  const [selectedCaps, setSelectedCaps] = useState<string[]>([]);
  const [selectedCons, setSelectedCons] = useState<string[]>([]);
  const [type, setType] = useState('UPLOAD');
  const [activityFilter, setActivityFilter] = useState('Todas');
  
  const [options, setOptions] = useState(['', '', '', '']); 
  const [correctOption, setCorrectOption] = useState(0); 
  
  const [expectedCode, setExpectedCode] = useState(''); 
  const [expectedOutput, setExpectedOutput] = useState(''); 
  const [isMultipleChoice, setIsMultipleChoice] = useState(false); 
  
  const [expectedCommand, setExpectedCommand] = useState(''); 
  const [acceptedAnswers, setAcceptedAnswers] = useState(['']); 
  
  const [pairs, setPairs] = useState([{ left: '', right: '' }]); 
  const [corrections, setCorrections] = useState([{ line: 0, text: '' }]); 

  const [iaModalOpen, setIaModalOpen] = useState(false);
  const [iaAssunto, setIaAssunto] = useState('');
  const [iaLoading, setIaLoading] = useState(false);
  const [iaError, setIaError] = useState('');
  const [iaData, setIaData] = useState<any>(null);
  const [iaBadgeVisible, setIaBadgeVisible] = useState(false);

  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState<string>('');
  const [alunosSelecionados, setAlunosSelecionados] = useState<{ id: string; name: string; email: string }[]>([]);

  const handleGenerateIA = async () => {
    if (!iaAssunto) return setIaError("Informe o assunto para gerar a questão.");
    setIaError('');
    setIaLoading(true);
    setIaData(null);
    try {
      const res = await fetch('http://localhost:3001/api/ia/gerar-atividade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: type,
          assunto: iaAssunto,
          nivelDificuldade,
          professorId: currentUser?.id
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setIaError(data.error || "Erro ao gerar questão.");
      } else {
        setIaData(data);
      }
    } catch (e) {
      setIaError("Erro de comunicação com o servidor.");
    } finally {
      setIaLoading(false);
    }
  };

  const handleApplyIA = () => {
    if (!iaData) return;
    setTitle(iaData.title || title);
    setDescription(iaData.description || description);
    
    if (type === 'MULTIPLA_ESCOLHA') {
      if (iaData.options) setOptions(iaData.options);
      if (iaData.correct !== undefined) setCorrectOption(iaData.correct);
    } else if (type === 'COMPLETAR_CODIGO' || type === 'CODIGO_EMBARALHADO' || type === 'SEQUENCIA_LOGICA') {
      if (iaData.expectedCode || iaData.expected) setExpectedCode(iaData.expectedCode || iaData.expected);
    } else if (type === 'COMPLETE_FRASE') {
      if (iaData.acceptedAnswers) setAcceptedAnswers(iaData.acceptedAnswers);
    } else if (type === 'TERMINAL_SIMULADO') {
      if (iaData.expectedCommand) setExpectedCommand(iaData.expectedCommand);
    } else if (type === 'PREDICT_OUTPUT') {
      if (iaData.expectedOutput) setExpectedOutput(iaData.expectedOutput);
    } else if (type === 'DIAGRAMA_ASSOCIACAO') {
      if (iaData.pairs) setPairs(iaData.pairs);
    } else if (type === 'DEBUG_CHALLENGE') {
      if (iaData.corrections) setCorrections(iaData.corrections);
    }

    setIaBadgeVisible(true);
    setIaModalOpen(false);
  };

  const [showGamification, setShowGamification] = useState(false);
  const [nivelDificuldade, setNivelDificuldade] = useState('MEDIO');
  const [xpBase, setXpBase] = useState(100);
  const [temTimer, setTemTimer] = useState(false);
  const [segundosLimite, setSegundosLimite] = useState(60);
  const [bonusVelocidade, setBonusVelocidade] = useState(false);
  
  const [dicaDisponivel, setDicaDisponivel] = useState(false);
  const [textoDica, setTextoDica] = useState('');
  const [custoXpDica, setCustoXpDica] = useState(10);
  
  const [ehQuestaoSecreta, setEhQuestaoSecreta] = useState(false);
  const [condicaoDesbloqueio, setCondicaoDesbloqueio] = useState('');
  
  const [temBauBonus, setTemBauBonus] = useState(false);
  const [resultadosBau, setResultadosBau] = useState([
    { tipo: 'DOBRAR_XP', valor: 0 },
    { tipo: 'XP_FIXO', valor: 50 },
    { tipo: 'PERDER_METADE', valor: 0 }
  ]);

  const [scoreForms, setScoreForms] = useState<Record<string, { score: number, feedback: string }>>({});

  useEffect(() => {
    if (nivelDificuldade === 'FACIL') setXpBase(50);
    else if (nivelDificuldade === 'MEDIO') setXpBase(100);
    else if (nivelDificuldade === 'DIFICIL') setXpBase(150);
    else if (nivelDificuldade === 'BOSS') setXpBase(300);
  }, [nivelDificuldade]);

  const toggleSelection = (id: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(id)) setList(list.filter(item => item !== id));
    else setList([...list, id]);
  };

  const handleCreateProva = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provaTitle || !provaCursoId) return alert("Preencha Título e Curso");
    if (provaPin.length !== 4) return alert('O PIN deve ter exatamente 4 dígitos numéricos.');
    await addProva({ title: provaTitle, description: provaDesc, cursoId: provaCursoId, professorId: currentUser!.id, turmaId: selectedTurmaId, ativa: provaAtiva, pin: provaPin } as any);
    setProvaTitle(''); setProvaDesc(''); setProvaCursoId(''); setSelectedTurmaId(''); setProvaAtiva(false); setProvaPin('');
    alert("Avaliação criada com sucesso!");
    setSubAbaAtiva('lancar_atividade'); setGrupoAtivo('provas');
  };

  
  const handleClearForm = () => {
    setTitle(''); setDescription(''); setSelectedCaps([]); setSelectedCons([]);
    setType('UPLOAD'); setActivityFilter('Todas');
    setOptions(['', '', '', '']); setCorrectOption(0);
    setExpectedCode(''); setExpectedOutput(''); setIsMultipleChoice(false);
    setExpectedCommand(''); setAcceptedAnswers(['']);
    setPairs([{ left: '', right: '' }]); setCorrections([{ line: 0, text: '' }]);
    setIaBadgeVisible(false);
    
    // Gamification
    setShowGamification(false); setNivelDificuldade('MEDIO'); setXpBase(100);
    setTemTimer(false); setSegundosLimite(60); setBonusVelocidade(false);
    setDicaDisponivel(false); setTextoDica(''); setCustoXpDica(10);
    setEhQuestaoSecreta(false); setCondicaoDesbloqueio('');
    setTemBauBonus(false);
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !provaId || selectedCaps.length === 0 || selectedCons.length === 0) {
      alert("Preencha todos os campos obrigatórios (título, prova, capacidades e conhecimentos).");
      return;
    }

    if (dicaDisponivel && !textoDica) return alert("Texto da dica obrigatório.");
    if (ehQuestaoSecreta && !condicaoDesbloqueio) return alert("Condição de desbloqueio obrigatória.");
    if (custoXpDica > xpBase) return alert("O custo da dica não pode ser maior que o XP base.");
    
    let configData: any = {};
    if (type === 'MULTIPLA_ESCOLHA') configData = { options, correct: correctOption };
    else if (type === 'COMPLETAR_CODIGO') configData = { expected: expectedCode };
    else if (type === 'CODIGO_EMBARALHADO' || type === 'SEQUENCIA_LOGICA') configData = { lines: expectedCode.split('\n').filter(l => l.trim() !== '') };
    else if (type === 'PREDICT_OUTPUT') configData = { expected: expectedOutput, isMultipleChoice, options, correct: correctOption };
    else if (type === 'TERMINAL_SIMULADO') configData = { expectedCommand };
    else if (type === 'COMPLETE_FRASE') configData = { acceptedAnswers };
    else if (type === 'DIAGRAMA_ASSOCIACAO') configData = { pairs };
    else if (type === 'DEBUG_CHALLENGE') configData = { corrections };

    const gamification = {
      xpBase, nivelDificuldade, temTimer, segundosLimite, bonusVelocidade,
      dicaDisponivel, textoDica, custoXpDica, ehQuestaoSecreta, condicaoDesbloqueio,
      temBauBonus, resultadosBau
    };

    addAtividade({ title, description, type, configData: JSON.stringify({...configData, gamification}), professorId: currentUser!.id, provaId } as any);
    setTitle(''); setDescription('');
    alert("Atividade salva com sucesso!");
  };

  const handleScore = (e: React.FormEvent, subId: string) => {
    e.preventDefault();
    const form = scoreForms[subId];
    if (form) {
      scoreSubmissao(subId, form.score, form.feedback);
      setScoreForms(prev => {
        const next = { ...prev };
        delete next[subId];
        return next;
      });
    }
  };

  
  const renderProvaCard = (p: any) => {
    const curso = cursos.find(c => c.id === p.cursoId);
    const colors: Record<string, string> = {
      'blue-500': 'text-blue-400 bg-blue-900/30 border-blue-500/50',
      'orange-500': 'text-orange-400 bg-orange-900/30 border-orange-500/50',
      'green-500': 'text-green-400 bg-green-900/30 border-green-500/50',
      'purple-500': 'text-purple-400 bg-purple-900/30 border-purple-500/50',
      'pink-500': 'text-pink-400 bg-pink-900/30 border-pink-500/50',
      'red-500': 'text-red-400 bg-red-900/30 border-red-500/50',
    };
    const badgeClass = (curso?.categoria?.cor && colors[curso.categoria.cor]) ? colors[curso.categoria.cor] : 'text-gray-400 bg-gray-800 border-gray-600';
    
    return (
      <li key={p.id} className="bg-gray-900 p-3 rounded border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <span className="text-blue-400 font-bold block">{p.title}</span>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {curso?.categoria && <span className={`px-2 py-0.5 rounded text-xs font-bold border ${badgeClass}`}>{curso.categoria.nome}</span>}
            <span className="text-gray-500 text-xs">{curso?.name}</span>
            {p.turmas && p.turmas.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded text-xs font-bold border text-green-400 bg-green-900/30 border-green-500/50">
                Turma: {turmas.find(t => t.id === p.turmas[0].turmaId)?.name || 'Desconhecida'}
              </span>
            )}
          </div>
        
          <div className="flex flex-wrap items-center mt-2 gap-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.ativa ? 'bg-green-900/40 text-green-400 border border-green-500/30' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                {p.ativa ? 'Ativa' : 'Inativa'}
              </span>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await toggleProvaAtiva(p.id, !p.ativa);
                  } catch (err: any) {
                    alert(err.message || 'Erro ao alterar status da prova.');
                  }
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${p.ativa ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${p.ativa ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
              <span className="text-xs text-gray-500">PIN:</span>
              {pinEditandoId === p.id ? (
                <>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={pinEditandoValor}
                    onChange={e => setPinEditandoValor(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-16 bg-gray-900 border border-blue-500 rounded px-2 py-1 text-white font-mono text-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (pinEditandoValor.length !== 4) return alert('O PIN deve ter 4 dígitos.');
                      try {
                        await atualizarPinProva(p.id, pinEditandoValor);
                        setPinEditandoId(null);
                      } catch (err: any) {
                        alert(err.message || 'Erro ao atualizar PIN.');
                      }
                    }}
                    className="text-green-500 hover:text-green-400 text-xs font-bold"
                  >
                    Salvar
                  </button>
                  <button type="button" onClick={() => setPinEditandoId(null)} className="text-gray-500 hover:text-white text-xs">
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <span className="font-mono text-white bg-gray-900 px-2 py-0.5 rounded border border-gray-700 text-sm tracking-widest">{p.pin || '----'}</span>
                  <button type="button" onClick={() => { setPinEditandoId(p.id); setPinEditandoValor(p.pin || ''); }} className="text-blue-400 hover:text-blue-300 text-xs">
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const novoPin = gerarPinAleatorio();
                      if (!confirm(`Gerar novo PIN aleatório (${novoPin}) para esta prova? O PIN antigo deixará de funcionar.`)) return;
                      try {
                        await atualizarPinProva(p.id, novoPin);
                      } catch (err: any) {
                        alert(err.message || 'Erro ao gerar novo PIN.');
                      }
                    }}
                    className="text-yellow-500 hover:text-yellow-400 text-xs"
                  >
                    Gerar Novo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-row md:flex-col gap-2">
          <button type="button" onClick={() => setProvaVisualizacaoId(p.id)} className="text-xs bg-blue-900/50 hover:bg-blue-800 text-blue-300 px-3 py-1.5 rounded font-bold border border-blue-500/50 w-full">
            Ver Questões
          </button>
          <button type="button" onClick={() => {
            setModalAtribuirProvaId(p.id);
            setModalAtribuirTurmaId('');
          }} className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded font-bold border border-gray-600 w-full">
            Reciclar / Clonar
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className="p-6">
      {/* HEADER E GRUPOS PRINCIPAIS */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight mb-6">Módulo do Professor</h1>
        
        <div className="flex gap-4">
          <button onClick={() => handleGrupoClick('provas')} className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${grupoAtivo === 'provas' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-[#1a2235] text-gray-400 hover:bg-gray-800 border border-gray-800'}`}>
            <FileText className="w-5 h-5" />
            <span>Avaliações e Atividades</span>
          </button>
          
          <button onClick={() => handleGrupoClick('turmas')} className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${grupoAtivo === 'turmas' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-[#1a2235] text-gray-400 hover:bg-gray-800 border border-gray-800'}`}>
            <List className="w-5 h-5" />
            <span>Turmas e Alunos</span>
          </button>

          <button onClick={() => handleGrupoClick('avaliacao')} className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${grupoAtivo === 'avaliacao' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-[#1a2235] text-gray-400 hover:bg-gray-800 border border-gray-800'}`}>
            <AlignLeft className="w-5 h-5" />
            <span>Correção e Relatórios</span>
          </button>
        </div>
      </div>

      {/* SUB-ABAS (Navegação Secundária) */}
      <div className="flex gap-2 border-b border-gray-800 pb-4 mb-8">
        {grupoAtivo === 'provas' && (
          <>
            <button className={`px-3 py-1 rounded text-sm ${subAbaAtiva === 'nova_prova' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setSubAbaAtiva('nova_prova')}>Nova Avaliação</button>
            <button className={`px-3 py-1 rounded text-sm ${subAbaAtiva === 'todas_avaliacoes' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setSubAbaAtiva('todas_avaliacoes')}>Todas as Avaliações</button>
            <button className={`px-3 py-1 rounded text-sm ${subAbaAtiva === 'lancar_atividade' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setSubAbaAtiva('lancar_atividade')}>Lançar Questão/Atividade</button>
          </>
        )}
        {grupoAtivo === 'turmas' && (
          <>
            <button className={`px-3 py-1 rounded text-sm ${subAbaAtiva === 'turmas' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setSubAbaAtiva('turmas')}>Turmas</button>
            {currentUser?.podeCriarTurma && (
              <button className={`px-3 py-1 rounded text-sm ${subAbaAtiva === 'cadastrar_alunos' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setSubAbaAtiva('cadastrar_alunos')}>Cadastrar Alunos</button>
            )}
          </>
        )}
        {grupoAtivo === 'avaliacao' && (
          <>
            <button className={`px-3 py-1 rounded text-sm ${subAbaAtiva === 'avaliar' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setSubAbaAtiva('avaliar')}>Avaliar Alunos</button>
            <button className={`px-3 py-1 rounded text-sm ${subAbaAtiva === 'ranking' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setSubAbaAtiva('ranking')}>Ranking Geral</button>
          </>
        )}
      </div>

      {subAbaAtiva === 'nova_prova' && (
        <div className="bg-[#1a2235] p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Nova Avaliação</h2>
          <form onSubmit={handleCreateProva} className="space-y-4">
            <div><label className="block text-sm text-gray-400 mb-1">Título</label><input type="text" value={provaTitle} onChange={e => setProvaTitle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" required /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Descrição</label><input type="text" value={provaDesc} onChange={e => setProvaDesc(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" required /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Curso</label><select value={provaCursoId} onChange={e => setProvaCursoId(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" required>
              <option value="">Selecione...</option>
              {categorias.map(cat => {
                const catCursos = cursos.filter(c => c.categoriaId === cat.id);
                if (catCursos.length === 0) return null;
                return (
                  <optgroup key={cat.id} label={cat.nome}>
                    {catCursos.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </optgroup>
                );
              })}
              {cursos.filter(c => !c.categoriaId).length > 0 && (
                <optgroup label="Sem Categoria">
                  {cursos.filter(c => !c.categoriaId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </optgroup>
              )}
            </select></div>
            
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Turma Destino {provaCursoId && `— ${turmas.filter(t => t.cursoId === provaCursoId).length} disponíveis`}
                </label>
                  <select value={selectedTurmaId} onChange={e => setSelectedTurmaId(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white">
                    <option value="">Deixar sem turma por enquanto...</option>
                    {turmas.filter(t => !provaCursoId || t.cursoId === provaCursoId).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
              </div>
            
            
            <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded p-3">
              <div>
                <p className="text-sm font-bold text-white">Prova Ativa</p>
                <p className="text-xs text-gray-500">Provas inativas não ficam visíveis para os alunos.</p>
              </div>
              <button
                type="button"
                onClick={() => setProvaAtiva(!provaAtiva)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${provaAtiva ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${provaAtiva ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">PIN de Desbloqueio (4 dígitos)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={provaPin}
                  onChange={e => setProvaPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="0000"
                  className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-lg tracking-widest"
                  required
                />
                <button
                  type="button"
                  onClick={() => setProvaPin(gerarPinAleatorio())}
                  className="bg-gray-800 border border-gray-700 px-3 rounded text-sm text-gray-300 hover:bg-gray-700 whitespace-nowrap"
                >
                  Gerar Aleatório
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Este PIN será solicitado se o aluno sair da tela durante a prova. Guarde-o — ele fica visível na listagem de Provas Existentes.
              </p>
            </div>
            
            <button type="submit" className="bg-blue-600 px-4 py-2 rounded text-white font-bold hover:bg-blue-500">Criar Avaliação</button>
          </form>
          <div className="mt-8">
            <h3 className="text-lg font-bold text-white mb-4">Avaliações Recentes</h3>
            <ul className="space-y-2">
              {provas.filter(p => p.professorId === currentUser?.id).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5).map(p => renderProvaCard(p))}
            </ul>
            <div className="mt-4 text-center">
              <button type="button" onClick={() => setSubAbaAtiva('todas_avaliacoes')} className="text-blue-400 hover:text-blue-300 text-sm font-bold">Ver todas as avaliações &rarr;</button>
            </div>
          </div>
        </div>
      )}

      
      {subAbaAtiva === 'todas_avaliacoes' && (
        <div className="bg-[#1a2235] p-6 rounded-lg border border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-white">Todas as Avaliações</h2>
            <div className="w-full md:w-1/3">
              <input
                type="text"
                placeholder="Buscar por título ou curso..."
                value={buscaProvas}
                onChange={e => setBuscaProvas(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm"
              />
            </div>
          </div>
          <ul className="space-y-2">
            {provas.filter(p => p.professorId === currentUser?.id).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).filter(p => {
              if (!buscaProvas) return true;
              const q = buscaProvas.toLowerCase();
              const curso = cursos.find(c => c.id === p.cursoId);
              const cat = curso?.categoria?.nome || '';
              return p.title.toLowerCase().includes(q) || (curso?.name || '').toLowerCase().includes(q) || cat.toLowerCase().includes(q);
            }).map(p => renderProvaCard(p))}
            {provas.filter(p => p.professorId === currentUser?.id).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).filter(p => {
              if (!buscaProvas) return true;
              const q = buscaProvas.toLowerCase();
              const curso = cursos.find(c => c.id === p.cursoId);
              const cat = curso?.categoria?.nome || '';
              return p.title.toLowerCase().includes(q) || (curso?.name || '').toLowerCase().includes(q) || cat.toLowerCase().includes(q);
            }).length === 0 && (
              <p className="text-gray-500 text-center py-8">Nenhuma avaliação encontrada com esta busca.</p>
            )}
          </ul>
        </div>
      )}

      {subAbaAtiva === 'lancar_atividade' && (
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* EDITOR (ESQUERDA) */}
          <div className="flex-1 space-y-6">
            <form onSubmit={handleCreateActivity} className="space-y-6 bg-[#1a2235] p-6 rounded-lg border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Lançar Nova Atividade</h2>
              
              {/* 1. CONFIGURAÇÃO BÁSICA */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-blue-400 border-b border-gray-700 pb-2">1. Configuração Básica</h3>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Selecione a Prova</label>
                  <select value={provaId} onChange={e => setProvaId(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" required>
                    <option value="">Selecione...</option>
                    {provas.filter(p => p.professorId === currentUser?.id).map(p => {
                      const c = cursos.find(curso => curso.id === p.cursoId);
                      return <option key={p.id} value={p.id}>{p.title} {c?.categoria?.nome ? `(${c.categoria.nome})` : ''}</option>;
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Perfil da Atividade</label>
                  <select value={activityFilter} onChange={e => setActivityFilter(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-4">
                    <option value="Todas">Todos os Perfis</option>
                    <option value="Tecnologia">Lógico / Técnico (Código, Terminal, Debug)</option>
                    <option value="Gestão">Processos / Organização (Sequência, Associação)</option>
                    <option value="Geral">Geral (Múltipla Escolha, Texto)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Selecione o Tipo de Atividade</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {QUESTION_TYPES.filter(qt => activityFilter === 'Todas' || qt.cat === activityFilter).map(qt => (
                      <button 
                        key={qt.id} type="button" onClick={() => setType(qt.id)}
                        className={`p-3 rounded-lg flex flex-col items-center justify-center text-center gap-2 border-2 transition-all \${type === qt.id ? 'border-blue-500 bg-blue-900/30 scale-105' : 'border-gray-800 bg-gray-900 hover:border-gray-600'}`}
                      >
                        <qt.icon className={`w-8 h-8 \${type === qt.id ? 'text-blue-400' : 'text-gray-500'}`} />
                        <span className="text-xs font-bold text-white">{qt.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Título da Questão</label>
                  <div className="flex gap-2">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="flex-1 w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" required />
                    <button type="button" onClick={() => setIaModalOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded font-bold flex items-center gap-2" title="Gerar com IA">
                      <Sparkles className="w-4 h-4" /> IA
                    </button>
                  </div>
                  {iaBadgeVisible && (
                    <span className="text-xs bg-purple-900/30 border border-purple-500/50 text-purple-400 px-2 py-0.5 rounded mt-2 inline-block">✨ Gerada por IA</span>
                  )}
                </div>
                <div><label className="block text-sm text-gray-400 mb-1">Enunciado (Markdown)</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white h-24 font-mono text-sm" required /></div>

                {/* DYNAMIC FIELDS BASED ON TYPE */}
                {type === 'MULTIPLA_ESCOLHA' && (
                  <div className="space-y-2 mt-4 border-t border-gray-700 pt-4">
                    <label className="block text-sm text-gray-400 mb-1">Opções de Resposta</label>
                    {options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="radio" name="correct" checked={correctOption === i} onChange={() => setCorrectOption(i)} />
                        <input type="text" value={opt} onChange={e => { const newOpts = [...options]; newOpts[i] = e.target.value; setOptions(newOpts); }} className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm" placeholder={`Opção ${i+1}`} required />
                      </div>
                    ))}
                  </div>
                )}
                
                {(type === 'COMPLETAR_CODIGO' || type === 'CODIGO_EMBARALHADO' || type === 'SEQUENCIA_LOGICA') && (
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <label className="block text-sm text-gray-400 mb-1">{type === 'SEQUENCIA_LOGICA' ? 'Passos na Ordem Correta (um por linha)' : 'Código Correto / Linhas Corretas'}</label>
                    <textarea value={expectedCode} onChange={e => setExpectedCode(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-sm h-32" placeholder="Escreva o código ou os passos..." required />
                  </div>
                )}
                
                {type === 'PREDICT_OUTPUT' && (
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <label className="block text-sm text-gray-400 mb-1">Saída Esperada (Output Exato)</label>
                    <input type="text" value={expectedOutput} onChange={e => setExpectedOutput(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-sm" required />
                  </div>
                )}
                
                {type === 'TERMINAL_SIMULADO' && (
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <label className="block text-sm text-gray-400 mb-1">Comando Esperado</label>
                    <input type="text" value={expectedCommand} onChange={e => setExpectedCommand(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-sm" placeholder="Ex: git commit -m 'mensagem'" required />
                  </div>
                )}
                
                {type === 'COMPLETE_FRASE' && (
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <label className="block text-sm text-gray-400 mb-1">Palavra(s) Aceita(s) (separadas por vírgula)</label>
                    <input type="text" value={acceptedAnswers.join(', ')} onChange={e => setAcceptedAnswers(e.target.value.split(',').map(s => s.trim()))} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm" required />
                  </div>
                )}
                
                {type === 'DEBUG_CHALLENGE' && (
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <label className="block text-sm text-gray-400 mb-1">Correção (Linha e Texto Correto)</label>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Nº Linha" value={corrections[0]?.line || ''} onChange={e => setCorrections([{ line: parseInt(e.target.value), text: corrections[0]?.text || '' }])} className="w-24 bg-gray-900 border border-gray-700 rounded p-2 text-white" required />
                      <input type="text" placeholder="Código correto da linha..." value={corrections[0]?.text || ''} onChange={e => setCorrections([{ line: corrections[0]?.line || 0, text: e.target.value }])} className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono" required />
                    </div>
                  </div>
                )}
                
                {type === 'DIAGRAMA_ASSOCIACAO' && (
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <label className="block text-sm text-gray-400 mb-1">Pares Corretos (ex: Backend - Node.js)</label>
                    {pairs.map((p, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input type="text" placeholder="Termo 1" value={p.left} onChange={e => { const newP = [...pairs]; newP[i].left = e.target.value; setPairs(newP); }} className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm" />
                        <span className="text-gray-500 pt-2">-&gt;</span>
                        <input type="text" placeholder="Termo 2" value={p.right} onChange={e => { const newP = [...pairs]; newP[i].right = e.target.value; setPairs(newP); }} className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm" />
                        {i === pairs.length - 1 ? (
                          <button type="button" onClick={() => setPairs([...pairs, { left: '', right: '' }])} className="text-green-400 px-2">+</button>
                        ) : (
                          <button type="button" onClick={() => setPairs(pairs.filter((_, idx) => idx !== i))} className="text-red-400 px-2">-</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. GAMIFICAÇÃO */}
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <button type="button" onClick={() => setShowGamification(!showGamification)} className="w-full flex justify-between items-center bg-gray-800 p-4 hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-yellow-500">2. Gamificação</h3>
                    {!showGamification && (
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${nivelDificuldade === 'BOSS' ? 'bg-yellow-900 text-yellow-400' : 'bg-gray-700 text-gray-300'}`}>{nivelDificuldade}</span>
                        {temTimer && <span className="text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded-full font-bold flex items-center">⏱ {segundosLimite}s</span>}
                        {dicaDisponivel && <span className="text-xs bg-blue-900/50 text-blue-400 px-2 py-1 rounded-full font-bold flex items-center">💡 Dica</span>}
                        {temBauBonus && <span className="text-xs bg-purple-900/50 text-purple-400 px-2 py-1 rounded-full font-bold flex items-center">🎁 Baú</span>}
                      </div>
                    )}
                  </div>
                  {showGamification ? <ChevronDown className="text-yellow-500" /> : <ChevronRight className="text-yellow-500" />}
                </button>
                
                {showGamification && (
                  <div className="p-4 bg-gray-900 space-y-6">
                    {/* SLIDER DE DIFICULDADE */}
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <label className="block text-sm text-gray-400">Nível de Dificuldade</label>
                        <span className="text-xl font-black text-white">{xpBase} XP</span>
                      </div>
                      <input 
                        type="range" min="0" max="3" step="1" 
                        value={nivelDificuldade === 'FACIL' ? 0 : nivelDificuldade === 'MEDIO' ? 1 : nivelDificuldade === 'DIFICIL' ? 2 : 3} 
                        onChange={e => {
                          const val = Number(e.target.value);
                          if (val === 0) setNivelDificuldade('FACIL');
                          if (val === 1) setNivelDificuldade('MEDIO');
                          if (val === 2) setNivelDificuldade('DIFICIL');
                          if (val === 3) setNivelDificuldade('BOSS');
                        }}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2 font-bold px-1">
                        <span className={nivelDificuldade === 'FACIL' ? 'text-green-400' : ''}>Fácil</span>
                        <span className={nivelDificuldade === 'MEDIO' ? 'text-blue-400' : ''}>Médio</span>
                        <span className={nivelDificuldade === 'DIFICIL' ? 'text-purple-400' : ''}>Difícil</span>
                        <span className={nivelDificuldade === 'BOSS' ? 'text-yellow-400' : ''}>BOSS</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-800">
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-white font-bold cursor-pointer">
                          <input type="checkbox" checked={temTimer} onChange={e => setTemTimer(e.target.checked)} className="w-4 h-4" /> Ativar Timer
                        </label>
                        {temTimer && (
                          <div className="pl-6 space-y-2">
                            <div>
                              <label className="block text-xs text-gray-400">Segundos</label>
                              <input type="number" value={segundosLimite} onChange={e => setSegundosLimite(Number(e.target.value))} className="w-20 bg-gray-800 p-1 text-white text-sm border border-gray-700 rounded" />
                            </div>
                            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                              <input type="checkbox" checked={bonusVelocidade} onChange={e => setBonusVelocidade(e.target.checked)} /> Bônus XP Vel. (x1.5)
                            </label>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-white font-bold cursor-pointer">
                          <input type="checkbox" checked={dicaDisponivel} onChange={e => setDicaDisponivel(e.target.checked)} className="w-4 h-4" /> Permitir Dica
                        </label>
                        {dicaDisponivel && (
                          <div className="pl-6 space-y-2">
                            <textarea placeholder="Texto da dica..." value={textoDica} onChange={e => setTextoDica(e.target.value)} rows={2} className="w-full bg-gray-800 p-2 text-white text-sm border border-gray-700 rounded"></textarea>
                            <div>
                              <label className="block text-xs text-gray-400">Custo (XP)</label>
                              <input type="number" value={custoXpDica} onChange={e => setCustoXpDica(Number(e.target.value))} max={xpBase} className="w-20 bg-gray-800 p-1 text-white text-sm border border-gray-700 rounded" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* BAU BONUS */}
                    <div className="pt-4 border-t border-gray-800">
                      <label className="flex items-center gap-2 text-yellow-400 font-bold cursor-pointer mb-4">
                        <Gift className="w-5 h-5" />
                        <input type="checkbox" checked={temBauBonus} onChange={e => setTemBauBonus(e.target.checked)} className="w-4 h-4" /> 
                        Ativar Mecânica "Baú do Tesouro" ao Acertar
                      </label>
                      {temBauBonus && (
                        <div className="pl-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                          {resultadosBau.map((bau, i) => (
                            <div key={i} className="bg-gray-800 p-3 rounded border border-yellow-900/50">
                              <label className="block text-xs text-gray-400 mb-1">Baú {i + 1}</label>
                              <select value={bau.tipo} onChange={e => { const b = [...resultadosBau]; b[i].tipo = e.target.value; setResultadosBau(b); }} className="w-full bg-gray-900 text-white text-sm p-1 rounded mb-2 border border-gray-700">
                                <option value="DOBRAR_XP">Dobrar XP</option>
                                <option value="XP_FIXO">XP Extra Fixo</option>
                                <option value="PERDER_METADE">Perder Metade XP</option>
                              </select>
                              {bau.tipo === 'XP_FIXO' && (
                                <input type="number" placeholder="Valor" value={bau.valor} onChange={e => { const b = [...resultadosBau]; b[i].valor = Number(e.target.value); setResultadosBau(b); }} className="w-full bg-gray-900 text-white text-sm p-1 rounded border border-gray-700" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. MAPA PEDAGÓGICO */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-green-400 border-b border-gray-700 pb-2">3. Mapa Pedagógico</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Capacidades (Clique para selecionar)</label>
                  <div className="flex flex-wrap gap-2">
                    {capacidades.map(c => {
                      const isSelected = selectedCaps.includes(c.id);
                      let color = 'border-blue-500/30 bg-blue-900/10 text-blue-400';
                      if (c.type === 'Técnica') color = 'border-purple-500/30 bg-purple-900/10 text-purple-400';
                      if (c.type === 'Socioemocional') color = 'border-orange-500/30 bg-orange-900/10 text-orange-400';
                      
                      return (
                        <button key={c.id} type="button" onClick={() => toggleSelection(c.id, selectedCaps, setSelectedCaps)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${isSelected ? color.replace('/10', '/50') + ' ring-2 ring-white/20' : 'border-gray-700 bg-gray-800 text-gray-500 hover:bg-gray-700'}`}>
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Conhecimentos</label>
                  <div className="flex flex-wrap gap-2">
                    {conhecimentos.map(c => (
                      <button key={c.id} type="button" onClick={() => toggleSelection(c.id, selectedCons, setSelectedCons)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${selectedCons.includes(c.id) ? 'border-green-500/50 bg-green-900/40 text-green-400' : 'border-gray-700 bg-gray-800 text-gray-500'}`}>
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={handleClearForm} className="flex-1 bg-gray-700 py-3 rounded-lg text-white font-black uppercase tracking-wider hover:bg-gray-600 transition-all shadow-lg">Limpar</button>
                <button type="submit" className="flex-[2] bg-blue-600 py-3 rounded-lg text-white font-black uppercase tracking-wider hover:bg-blue-500 hover:scale-[1.01] transition-all shadow-lg">Publicar Atividade</button>
              </div>
            </form>
          </div>

          {/* LIVE PREVIEW (DIREITA) */}
          <div className="hidden lg:block w-96 relative">
            <div className="sticky top-6 bg-[#0b0f19] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[800px]">
              <div className="bg-gray-900 p-3 border-b border-gray-800 flex justify-between items-center">
                <span className="text-gray-400 text-sm font-bold flex items-center gap-2"><Eye className="w-4 h-4"/> Live Preview (Aluno)</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {/* Header Preview */}
                <div className="flex justify-between items-center bg-[#1a2235] p-3 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-2 bg-gray-900 px-3 py-1 rounded border border-gray-700">
                    <Zap className="text-yellow-400 w-4 h-4" />
                    <span className="text-sm font-black text-white">{xpBase} XP</span>
                  </div>
                  {temTimer && (
                    <div className="w-20 bg-gray-900 h-2 rounded-full overflow-hidden">
                      <div className="w-full bg-green-500 h-full"></div>
                    </div>
                  )}
                </div>

                <div className={`p-4 rounded-xl border bg-[#111827] ${nivelDificuldade === 'BOSS' ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-gray-800'}`}>
                  <div className="flex gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-900/30 text-blue-400"><HelpCircle className="w-6 h-6"/></div>
                    <div>
                      {nivelDificuldade === 'BOSS' && <p className="text-[10px] text-yellow-500 font-black uppercase mb-1">Boss Challenge</p>}
                      <h4 className="text-lg font-bold text-white leading-tight">{title || 'Título da Questão'}</h4>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-6 whitespace-pre-wrap">{description || 'Descrição da questão aparecerá aqui.'}</p>
                  
                  {/* Mock of the answer UI */}
                  <div className="space-y-3 opacity-80 pointer-events-none">
                    {type === 'MULTIPLA_ESCOLHA' && options.map((o, i) => (
                      <div key={i} className="p-3 border border-gray-700 bg-gray-800 rounded text-sm text-gray-300 flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border border-gray-500"></div> {o || `Opção ${i+1}`}
                      </div>
                    ))}
                    {type === 'COMPLETAR_CODIGO' && (
                      <div className="p-4 bg-black border border-gray-700 rounded font-mono text-green-400 text-sm">...</div>
                    )}
                    {(type === 'CODIGO_EMBARALHADO' || type === 'SEQUENCIA_LOGICA') && expectedCode.split('\n').filter(Boolean).map((l, i) => (
                      <div key={i} className="p-3 border border-gray-700 bg-gray-800 rounded font-mono text-sm text-gray-300 text-center"> = {l} = </div>
                    ))}
                    {type === 'TERMINAL_SIMULADO' && (
                      <div className="p-4 bg-black border border-gray-700 rounded font-mono text-white text-sm flex gap-2">
                        <span className="text-green-500">user@sh:~$</span> <span className="animate-pulse">_</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-800">
                      <div>
                        {dicaDisponivel && <span className="text-xs text-yellow-500 font-bold">💡 Dica (-{custoXpDica}XP)</span>}
                      </div>
                      <div className="px-4 py-2 bg-blue-600 rounded text-xs font-bold text-white">Confirmar</div>
                    </div>
                  </div>
                </div>

                {temBauBonus && (
                  <div className="mt-4 border-t border-dashed border-gray-700 pt-4 text-center">
                    <p className="text-xs text-gray-500 mb-2 font-bold uppercase">Ao acertar, o aluno escolhe um baú:</p>
                    <div className="flex justify-center gap-3">
                      <Gift className="text-yellow-500 w-8 h-8 opacity-70" />
                      <Gift className="text-yellow-500 w-8 h-8 opacity-70" />
                      <Gift className="text-yellow-500 w-8 h-8 opacity-70" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      )}
      {subAbaAtiva === 'turmas' && (
        <div className="bg-[#1a2235] p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Minhas Turmas</h2>
          
          {currentUser?.podeCriarTurma === true ? (
            <form onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const name = f.get('name') as string;
              const codigo = f.get('codigo') as string;
              const cursoId = f.get('cursoId') as string;
              
              if (!cursoId) return alert("Selecione o Curso.");
              
              try {
                const res = await addTurma({ nome: name, name, codigo, cursoId, professorId: currentUser!.id, userId: currentUser!.id } as any);
                if (alunosSelecionados.length > 0 && res.id) {
                  await vincularAlunos(res.id, alunosSelecionados.map(a => a.id));
                }
                alert("Turma criada com sucesso!");
                e.currentTarget.reset();
                setAlunosSelecionados([]);
              } catch (err: any) {
                alert(err.message || 'Erro ao criar turma');
              }
            }} className="mb-6 flex flex-col gap-3">
              <input type="text" name="name" placeholder="Nome da Turma" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" required />
              <input type="text" name="codigo" placeholder="Código da Turma" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" required />
              
              <select name="cursoId" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" required>
                <option value="">Selecione o Curso...</option>
                {categorias.map(cat => {
                  const catCursos = cursos.filter(c => c.categoriaId === cat.id);
                  if (catCursos.length === 0) return null;
                  return (
                    <optgroup key={cat.id} label={cat.nome}>
                      {catCursos.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </optgroup>
                  );
                })}
              </select>

              <div className="bg-gray-800/50 p-4 border border-gray-700 rounded">
                <SeletorDeAlunos 
                  alunosSelecionados={alunosSelecionados} 
                  setAlunosSelecionados={setAlunosSelecionados} 
                  users={users} 
                  registerUser={registerUser} 
                />
              </div>

              <button type="submit" className="bg-blue-600 px-4 py-3 rounded text-white font-bold hover:bg-blue-700 mt-2">Criar Nova Turma</button>
            </form>
          ) : (
            <div className="bg-yellow-900/30 p-4 rounded text-yellow-500 mb-6 border border-yellow-500/30">
              Criação de turmas desativada. Solicite liberação ao administrador.
            </div>
          )}

          <div className="space-y-4">
            {turmas.filter(t => t.professorId === currentUser?.id).map(t => (
              <div key={t.id} className="bg-gray-900 p-4 rounded border border-gray-700 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white">{t.name} <span className="text-gray-500 text-sm">({t.codigo})</span></h3>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">{(t as any).alunos?.length || 0} aluno(s) matriculado(s)</p>
                    {(t as any).alunos?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(t as any).alunos.map((a: any) => (
                          <span key={a.aluno.id} className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">{a.aluno.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {currentUser?.podeCriarTurma && (
                  <div className="mt-3">
                    <button 
                      type="button" 
                      onClick={() => { setTurmaSelecionadaId(t.id); setSubAbaAtiva('cadastrar_alunos'); }} 
                      className="w-full bg-gray-800 border border-gray-700 py-2 text-sm text-white rounded hover:bg-gray-700 font-bold"
                    >
                      Gerenciar Alunos desta Turma
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {subAbaAtiva === 'ranking' && (
        <div className="text-white p-6 bg-[#1a2235] rounded-lg border border-gray-800">Ranking Geral (Placeholder)</div>
      )}

      {subAbaAtiva === 'cadastrar_alunos' && !currentUser?.podeCriarTurma && (
        <div className="bg-yellow-900/30 p-4 rounded text-yellow-500 mb-6 border border-yellow-500/30">
          Você não tem permissão para cadastrar ou gerenciar alunos. Solicite liberação ao administrador.
        </div>
      )}
      
      {subAbaAtiva === 'cadastrar_alunos' && currentUser?.podeCriarTurma && (
        <div className="space-y-6">
          <div className="bg-[#1a2235] p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-2">Cadastrar Novo Aluno</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const name = f.get('nome') as string;
              const username = f.get('email') as string;
              try {
                const res = await fetch('http://localhost:3001/api/users', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name, username, role: 'aluno', password: 'mudar123', senhaTemporaria: true })
                });
                if (!res.ok) throw new Error('E-mail já em uso ou erro no servidor');
                await res.json();
                alert('Aluno cadastrado com sucesso!');
                e.currentTarget.reset();
              } catch (err: any) {
                alert('Erro ao cadastrar: ' + (err.message || 'E-mail já em uso?'));
              }
            }} className="flex flex-col md:flex-row gap-4 md:items-end">
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-1">Nome Completo</label>
                <input type="text" name="nome" required placeholder="Ex: Maria Santos" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-1">E-mail (Login)</label>
                <input type="text" name="email" required placeholder="Ex: maria@escola.com" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
              </div>
              <button type="submit" className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded md:h-[42px] whitespace-nowrap">Cadastrar</button>
            </form>

            <hr className="border-gray-700 my-6" />
            
            <h2 className="text-lg font-bold text-white mb-2">Resetar Senha</h2>
            <p className="text-sm text-gray-400 mb-4">A senha será redefinida para a senha padrão ("mudar123") e o aluno será forçado a trocar no primeiro acesso.</p>
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              <div className="flex-1 relative">
                <label className="block text-sm text-gray-400 mb-1">Selecione o Aluno</label>
                <select id="resetUserSelect" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white">
                   <option value="">Buscar aluno...</option>
                   {users.filter(u => u.role === 'aluno').map(u => (
                     <option key={u.id} value={u.id}>{u.name} ({u.username})</option>
                   ))}
                </select>
              </div>
              <button type="button" onClick={async () => {
                const sel = document.getElementById('resetUserSelect') as HTMLSelectElement;
                if (!sel || !sel.value) return alert('Selecione um aluno!');
                if (!confirm('Tem certeza que deseja resetar a senha deste aluno para mudar123?')) return;
                try {
                  const res = await fetch(`http://localhost:3001/api/users/${sel.value}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: 'mudar123', senhaTemporaria: true })
                  });
                  if (!res.ok) throw new Error('Erro ao resetar senha');
                  alert('Senha resetada com sucesso para mudar123!');
                  sel.value = '';
                } catch (err: any) {
                  alert(err.message);
                }
              }} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded md:h-[42px] whitespace-nowrap">Resetar Senha</button>
            </div>
          </div>

          <div className="bg-[#1a2235] p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Importar Alunos (CSV/XLSX)</h2>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Selecione a Turma de destino</label>
              <select 
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                onChange={(e) => setTurmaSelecionadaId(e.target.value)}
                value={turmaSelecionadaId || ''}
              >
                <option value="">Selecione...</option>
                {turmas.filter(t => t.professorId === currentUser?.id).map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.codigo})</option>
                ))}
              </select>
            </div>
            
            {turmaSelecionadaId && (
              <input type="file" accept=".csv,.xlsx" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const formData = new FormData();
                formData.append('file', file);
                try {
                  const res = await uploadAlunos(turmaSelecionadaId, formData);
                  alert(`Resumo: ${res.criados} criados, ${res.jaExistiam} já existiam.\nAlertas: ${res.alertas.length}\nRejeitados: ${res.rejeitados.length}`);
                } catch (err: any) {
                  alert(err.message || 'Erro no upload');
                }
              }} className="w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer border border-gray-700 rounded bg-gray-900 p-2" />
            )}
          </div>
        </div>
      )}

      
      {modalAtribuirProvaId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a2235] border border-blue-500/30 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-2">Reciclar / Clonar Avaliação</h3>
            <p className="text-sm text-gray-400 mb-4">Escolha a nova Turma para aplicar esta avaliação. Uma cópia independente (deep copy) com todas as questões será criada.</p>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {turmas.filter(t => t.professorId === currentUser?.id).map(t => {
                const isSelected = modalAtribuirTurmaId === t.id;
                return (
                  <div key={t.id} onClick={() => setModalAtribuirTurmaId(t.id)} className={`cursor-pointer p-3 rounded border flex items-center justify-between transition-colors ${isSelected ? 'bg-blue-900/30 border-blue-500' : 'bg-gray-900 border-gray-700 hover:border-gray-500'}`}>
                    <div>
                      <span className={`font-bold ${isSelected ? 'text-blue-400' : 'text-gray-300'}`}>{t.name}</span>
                      <p className="text-xs text-gray-500">{t.codigo}</p>
                    </div>
                    {isSelected && <span className="text-blue-500 font-bold">✓</span>}
                  </div>
                );
              })}
              {turmas.filter(t => t.professorId === currentUser?.id).length === 0 && (
                <p className="text-gray-500 text-sm italic">Nenhuma turma encontrada.</p>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModalAtribuirProvaId(null)} className="px-4 py-2 text-gray-400 hover:text-white font-bold">Cancelar</button>
              <button onClick={async () => {
                if (!modalAtribuirTurmaId) return alert('Selecione a turma de destino!');
                try {
                  await clonarProva(modalAtribuirProvaId, modalAtribuirTurmaId);
                  alert('Avaliação reciclada e vinculada à nova turma com sucesso!');
                  setModalAtribuirProvaId(null);
                } catch(e: any) {
                  alert(e.message || 'Erro ao clonar avaliação');
                }
              }} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold">Gerar Cópia</button>
            </div>
          </div>
        </div>
      )}

      {/* IA Modal */}

      {/* Modal Cadastrar Aluno Manualmente */}
      
      

      

      {iaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a2235] border border-purple-500/30 rounded-xl p-6 w-full max-w-lg shadow-2xl relative">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4"><Sparkles className="text-purple-400" /> Gerar Questão com IA</h2>
            
            <div className="bg-gray-900 p-3 rounded text-sm text-gray-400 mb-4 border border-gray-800">
              <p><strong>Tipo selecionado:</strong> {QUESTION_TYPES.find(q => q.id === type)?.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <strong>Dificuldade:</strong>
                <select value={nivelDificuldade} onChange={e => setNivelDificuldade(e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs outline-none">
                  <option value="FACIL">Fácil</option>
                  <option value="MEDIO">Médio</option>
                  <option value="DIFICIL">Difícil</option>
                  <option value="BOSS">Boss</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">Assunto a avaliar *</label>
              <input type="text" value={iaAssunto} onChange={e => setIaAssunto(e.target.value)} placeholder="Ex: Laços de repetição em JavaScript (for e while)" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white" />
            </div>

            {iaError && <div className="text-red-400 bg-red-900/20 p-3 rounded mb-4 text-sm border border-red-500/30">{iaError}</div>}

            {iaData && (
              <div className="bg-gray-900 border border-green-500/30 p-4 rounded mb-4 text-sm text-gray-300 max-h-48 overflow-y-auto">
                <p className="text-white font-bold mb-1">{iaData.title}</p>
                <p className="mb-2 text-xs">{iaData.description}</p>
                {iaData.options && <ul className="list-disc pl-4 text-xs">{iaData.options.map((o: string, i: number) => <li key={i} className={i === iaData.correct ? 'text-green-400' : ''}>{o}</li>)}</ul>}
                {iaData.expected && <pre className="bg-black p-2 rounded mt-2 font-mono text-[10px] text-blue-400 overflow-x-auto">{iaData.expected}</pre>}
                {iaData.acceptedAnswers && <p className="text-xs mt-2"><strong className="text-white">Respostas aceitas:</strong> {iaData.acceptedAnswers.join(', ')}</p>}
                {iaData.expectedCommand && <p className="text-xs mt-2 font-mono bg-black p-1 text-green-400">~$ {iaData.expectedCommand}</p>}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIaModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
              
              {iaData ? (
                <>
                  <button onClick={handleGenerateIA} disabled={iaLoading} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-bold disabled:opacity-50">Gerar Novamente</button>
                  <button onClick={handleApplyIA} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold">Usar esta sugestão</button>
                </>
              ) : (
                <button onClick={handleGenerateIA} disabled={iaLoading} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold flex items-center gap-2">
                  {iaLoading ? 'Gerando...' : 'Gerar'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ModalVerQuestoes 
        isOpen={!!provaVisualizacaoId} 
        onClose={() => setProvaVisualizacaoId(null)} 
        prova={provas.find(p => p.id === provaVisualizacaoId)} 
        atividades={atividades} 
      />
    </div>
  );
};