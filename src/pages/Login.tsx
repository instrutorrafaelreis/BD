import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Map, Sparkles, Flame, Trophy, CheckCircle, Zap } from 'lucide-react';

export const Login: React.FC = () => {
  const { users, login, currentUser } = useAppContext();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Toggle visual: apenas cosmético/contextual por enquanto, não afeta a lógica de auth backend
  const [roleToggle, setRoleToggle] = useState<'admin' | 'professor' | 'aluno'>('aluno');

  useEffect(() => {
    if (currentUser && !currentUser.senhaTemporaria) {
      if (currentUser.role === 'admin') navigate('/admin');
      if (currentUser.role === 'professor') navigate('/professor');
      if (currentUser.role === 'aluno') navigate('/aluno');
    }
  }, [currentUser, navigate]);

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [passError, setPassError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await login(username, password);
    if (!user) setError('Usuário ou senha inválidos.');
  };

  const handleTrocarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) return setPassError('As senhas não coincidem.');
    try {
      const res = await fetch(`http://localhost:3001/api/usuarios/trocar-senha`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser!.id, senhaAtual: password, novaSenha })
      });
      if (res.ok) {
        // Force refresh to remove senhaTemporaria flag
        window.location.reload();
      } else {
        const err = await res.json();
        setPassError(err.error || 'Erro ao trocar senha');
      }
    } catch {
      setPassError('Erro de comunicação.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0d1117] font-sans">
      
      {/* LEFT PANEL - PRESENTATION */}
      <div className="flex-1 bg-gradient-to-br from-blue-900/30 to-[#0d1117] border-b md:border-b-0 md:border-r border-gray-800 p-8 md:p-16 flex flex-col justify-center md:justify-between relative overflow-hidden">
        
        {/* Decorative background grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "linear-gradient(#374151 1px, transparent 1px), linear-gradient(90deg, #374151 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 md:mb-16">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <Map className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Trilha do Saber</h1>
          </div>
          
          <h2 className="text-2xl md:text-5xl font-bold text-white mb-8 leading-tight max-w-2xl">
            Avaliações que engajam como um <span className="text-blue-500">jogo</span>.
          </h2>
          
          <div className="space-y-6 hidden md:block mt-12">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20"><Sparkles className="text-green-500 w-6 h-6" /></div>
              <p className="text-gray-300 text-lg font-medium">Correção automatizada de exercícios e respostas em tempo real.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/20"><Flame className="text-orange-500 w-6 h-6" /></div>
              <p className="text-gray-300 text-lg font-medium">Gamificação com XP, Rank Global e Streaks.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20"><CheckCircle className="text-purple-400 w-6 h-6" /></div>
              <p className="text-gray-300 text-lg font-medium">Mapeamento preciso de habilidades pedagógicas.</p>
            </div>
          </div>
        </div>

        {/* Dummy Gamification Card */}
        <div className="relative z-10 mt-12 w-fit hidden md:flex items-center gap-4 bg-gray-900/80 backdrop-blur-md border border-gray-700 p-4 rounded-xl shadow-xl">
          <div className="bg-yellow-900/30 p-2.5 rounded-lg shrink-0">
            <Trophy className="w-7 h-7 text-yellow-400" />
          </div>
          <div className="min-w-0 pr-4">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-0.5 truncate">Hall da Fama</p>
            <p className="text-white font-black text-lg whitespace-nowrap">Rank #1 <span className="text-blue-400 ml-1">2.450 XP</span></p>
          </div>
          <div className="ml-auto bg-green-500/20 px-2.5 py-1 rounded text-green-400 text-xs font-bold flex items-center gap-1 shrink-0">
            <Zap className="w-3 h-3" />
            +50
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="w-full md:w-[480px] lg:w-[560px] bg-[#0d1117] flex flex-col justify-center p-8 md:p-12 relative min-h-[60vh] md:min-h-screen">
        <div className="max-w-sm w-full mx-auto relative z-10">
          <h3 className="text-2xl font-bold text-white mb-8 text-center md:text-left">Acessar minha conta</h3>
          
          {users.length === 0 ? (
            <div className="text-center space-y-4 bg-gray-900 p-6 rounded-xl border border-gray-800">
              <p className="text-yellow-500 font-medium">Banco de dados vazio.</p>
              <button 
                onClick={async () => {
                  await fetch('http://localhost:3001/api/seed', { method: 'POST' });
                  window.location.reload();
                }}
                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold w-full transition-colors"
              >
                Popular Banco de Dados
              </button>
            </div>
          ) : (
            <>
              {currentUser && currentUser.senhaTemporaria ? (
                <form onSubmit={handleTrocarSenha} className="flex flex-col gap-5">
                  <div className="bg-yellow-900/30 border border-yellow-500/30 p-4 rounded-xl mb-4">
                    <p className="text-yellow-500 text-sm font-medium">Por segurança, você deve alterar sua senha no primeiro acesso.</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1.5 font-medium">Nova Senha</label>
                    <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600" required />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1.5 font-medium">Confirmar Nova Senha</label>
                    <input type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600" required />
                  </div>
                  {passError && <p className="text-red-500 text-sm font-medium bg-red-900/20 p-3 rounded-lg border border-red-500/20">{passError}</p>}
                  <button type="submit" className="w-full py-4 rounded-xl text-white font-bold mt-2 shadow-[0_0_15px_rgba(0,0,0,0)] transition-all bg-green-600 hover:bg-green-500 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]">
                    Salvar Nova Senha
                  </button>
                </form>
              ) : (
                <>
                  <div className="flex bg-gray-900 p-1.5 rounded-xl border border-gray-800 mb-8">
                    <button type="button" onClick={() => setRoleToggle('admin')} className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${roleToggle === 'admin' ? 'bg-gray-700 text-white shadow-lg border border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}>Admin</button>
                    <button type="button" onClick={() => setRoleToggle('professor')} className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${roleToggle === 'professor' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>Professor</button>
                    <button type="button" onClick={() => setRoleToggle('aluno')} className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${roleToggle === 'aluno' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>Aluno</button>
                  </div>

                  <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1.5 font-medium">Nome de Usuário</label>
                      <input type="text" placeholder="seu.usuario" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600" required />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1.5 font-medium">Senha</label>
                      <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600" required />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm font-medium bg-red-900/20 p-3 rounded-lg border border-red-500/20">{error}</p>}
                    
                    <button type="submit" className={`w-full py-4 rounded-xl text-white font-bold mt-2 shadow-[0_0_15px_rgba(0,0,0,0)] transition-all ${roleToggle === 'admin' ? 'bg-gray-700 hover:bg-gray-600 hover:shadow-[0_0_25px_rgba(55,65,81,0.4)] border border-blue-500/30' : roleToggle === 'aluno' ? 'bg-purple-600 hover:bg-purple-500 hover:shadow-[0_0_25px_rgba(147,51,234,0.4)]' : 'bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]'} hover:-translate-y-0.5`}>
                      Entrar
                    </button>
                    
                    <div className="text-center mt-4">
                      <button type="button" onClick={() => alert('Funcionalidade em breve!')} className="text-sm text-gray-500 hover:text-white transition-colors font-medium">Esqueci minha senha</button>
                    </div>
                  </form>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-xs text-gray-600 font-medium">© 2026 Trilha do Saber · v1.0.0</p>
        </div>
      </div>
    </div>
  );
};
