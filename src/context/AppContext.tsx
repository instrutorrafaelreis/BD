import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User, Curso, Prova, Capacidade, Conhecimento, Atividade, Submissao, Turma } from '../types';

interface AppState {
  currentUser: User | null;
  users: User[];
  cursos: Curso[];
  turmas: Turma[];
  categorias: any[];
  addCategoria: (cat: Partial<any>) => Promise<void>;
  updateCategoria: (id: string, cat: Partial<any>) => Promise<void>;
  deleteCategoria: (id: string) => Promise<void>;
  provas: Prova[];
  capacidades: Capacidade[];
  conhecimentos: Conhecimento[];
  atividades: Atividade[];
  submissoes: Submissao[];
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
  registerUser: (name: string, username: string, password: string, role: string) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  addCurso: (curso: Omit<Curso, 'id'>) => Promise<void>;
  addProva: (prova: Omit<Prova, 'id'>) => Promise<void>;
  toggleProvaAtiva: (id: string, ativa: boolean) => Promise<void>;
    atualizarPinProva: (id: string, pin: string) => Promise<void>;
  clonarProva: (provaId: string, novaTurmaId: string) => Promise<void>;
  addCapacidade: (cap: Omit<Capacidade, 'id'>) => Promise<void>;
  addConhecimento: (con: Omit<Conhecimento, 'id'>) => Promise<void>;
  addAtividade: (ativ: Omit<Atividade, 'id' | 'createdAt'>) => Promise<void>;
  addSubmissao: (sub: any) => Promise<any>;
  scoreSubmissao: (subId: string, score: number, feedback: string) => Promise<void>;
  addTurma: (turma: Omit<Turma, 'id'>) => Promise<any>;
  deleteTurma: (id: string) => Promise<void>;
  togglePodeCriarTurma: (userId: string, podeCriar: boolean) => Promise<void>;
  uploadAlunos: (turmaId: string, formData: FormData) => Promise<any>;
  addAlunoTurma: (turmaId: string, data: any) => Promise<any>;
  vincularAlunos: (turmaId: string, alunoIds: string[]) => Promise<any>;
}

const API_URL = 'http://localhost:3001/api';

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [provas, setProvas] = useState<Prova[]>([]);
  const [capacidades, setCapacidades] = useState<Capacidade[]>([]);
  const [conhecimentos, setConhecimentos] = useState<Conhecimento[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);

  const loadData = async (role?: string) => {
    try {
      const qs = currentUser ? `?userId=${currentUser.id}` : '';
      const [u, cur, pr, cap, con, at, sub, catRes, tr] = await Promise.all([
        fetch(`${API_URL}/users`).then(res => res.json()),
        fetch(`${API_URL}/cursos`).then(res => res.json()),
        fetch(`${API_URL}/provas?role=${role || ''}`).then(res => res.json()),
        fetch(`${API_URL}/capacidades`).then(res => res.json()),
        fetch(`${API_URL}/conhecimentos`).then(res => res.json()),
        fetch(`${API_URL}/atividades?role=${role || ''}`).then(res => res.json()),
        fetch(`${API_URL}/submissoes`).then(res => res.json()),
        fetch(`${API_URL}/categorias`).then(res => res.json()),
        fetch(`${API_URL}/turmas${qs}`).then(res => res.json()).catch(() => []),
      ]);
      setUsers(u); setCursos(cur); setProvas(pr); setCapacidades(cap); 
      setConhecimentos(con); setAtividades(at); setSubmissoes(sub); setCategorias(catRes); setTurmas(Array.isArray(tr) ? tr : []);
    } catch (e) {
      console.error("Backend not running or error fetching data", e);
    }
  };

  useEffect(() => {
    loadData(currentUser?.role);
  }, [currentUser]);

  const login = async (username: string, password: string): Promise<User | null> => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        return user;
      }
      return null;
    } catch { return null; }
  };

  const logout = () => setCurrentUser(null);

  
  const updateUser = async (id: string, updates: Partial<User>) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      await loadData();
    } else {
      const err = await res.json();
      throw new Error(err.error || "Erro ao atualizar usuário");
    }
  };

  const registerUser = async (name: string, username: string, password: string, role: string) => {
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, username, password, role })
    });
    if (res.ok) await loadData();
    else throw new Error("Erro ao criar usuário");
  };

  
  const addCategoria = async (cat: Partial<Categoria>) => {
    await fetch('http://localhost:3001/api/categorias', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cat)
    });
    loadData();
  };
  const updateCategoria = async (id: string, cat: Partial<Categoria>) => {
    await fetch(`http://localhost:3001/api/categorias/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cat)
    });
    loadData();
  };
  const deleteCategoria = async (id: string) => {
    await fetch(`http://localhost:3001/api/categorias/${id}`, { method: 'DELETE' });
    loadData();
  };

  const addCurso = async (curso: Omit<Curso, 'id'>) => {
    const res = await fetch(`${API_URL}/cursos`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(curso)
    });
    if (res.ok) await loadData();
  };

  const addProva = async (prova: Omit<Prova, 'id'>) => {
    const res = await fetch(`${API_URL}/provas`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prova)
    });
    if (res.ok) await loadData();
  };

  
  const atualizarPinProva = async (id: string, pin: string) => {
    try {
      const res = await fetch(`${API_URL}/provas/${id}/pin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, userId: currentUser?.id })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Erro ao atualizar PIN');
      }
      setProvas(provas.map(p => p.id === id ? { ...p, pin } : p));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const toggleProvaAtiva = async (id: string, ativa: boolean) => {
    try {
      const res = await fetch(`${API_URL}/provas/${id}/ativar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativa, userId: currentUser?.id })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Erro ao alterar status');
      }
      setProvas(provas.map(p => p.id === id ? { ...p, ativa } : p));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const clonarProva = async (provaId: string, novaTurmaId: string) => {
    const res = await fetch(`${API_URL}/provas/${provaId}/clonar`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ novaTurmaId })
    });
    if (res.ok) await loadData();
    else throw new Error("Erro ao clonar avaliação");
  };

  const addCapacidade = async (cap: Omit<Capacidade, 'id'>) => {
    const res = await fetch(`${API_URL}/capacidades`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cap)
    });
    if (res.ok) await loadData();
  };

  const addConhecimento = async (con: Omit<Conhecimento, 'id'>) => {
    const res = await fetch(`${API_URL}/conhecimentos`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(con)
    });
    if (res.ok) await loadData();
  };

  const addAtividade = async (ativ: Omit<Atividade, 'id' | 'createdAt'>) => {
    const res = await fetch(`${API_URL}/atividades`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ativ)
    });
    if (res.ok) await loadData();
  };

  const addSubmissao = async (sub: any) => {
    const res = await fetch(`${API_URL}/submissoes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub)
    });
    if (res.ok) {
      const data = await res.json();
      await loadData(currentUser?.role);
      return data;
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao submeter');
    }
  };

  const scoreSubmissao = async (subId: string, score: number, feedback: string) => {
    const res = await fetch(`${API_URL}/submissoes/${subId}/score`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ score, feedback })
    });
    if (res.ok) await loadData();
  };

  const addTurma = async (turma: Omit<Turma, 'id'>) => {
    const res = await fetch(`${API_URL}/turmas`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(turma)
    });
    if (res.ok) {
      const data = await res.json();
      await loadData(currentUser?.role);
      return data;
    }
    const err = await res.json();
    throw new Error(err.error || 'Erro ao criar turma');
  };

  const deleteTurma = async (id: string) => {
    const res = await fetch(`${API_URL}/turmas/${id}`, { method: 'DELETE' });
    if (res.ok) await loadData(currentUser?.role);
  };

  const togglePodeCriarTurma = async (userId: string, podeCriar: boolean) => {
    const res = await fetch(`${API_URL}/users/${userId}/permissao-turma`, {
      method: 'PATCH', 
      headers: { 
        'Content-Type': 'application/json',
        'userid': currentUser?.id || ''
      }, 
      body: JSON.stringify({ podeCriarTurma: podeCriar })
    });
    if (res.ok) await loadData(currentUser?.role);
    else {
      const err = await res.json();
      alert(err.error || 'Erro ao alterar permissão');
    }
  };

  
  const vincularAlunos = async (turmaId: string, alunoIds: string[]) => {
    const res = await fetch(`${API_URL}/turmas/${turmaId}/alunos/vincular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'userid': currentUser?.id || '' },
      body: JSON.stringify({ alunoIds })
    });
    if (!res.ok) throw new Error('Erro ao vincular alunos');
    await loadData(currentUser?.role);
    return await res.json();
  };

  const addAlunoTurma = async (turmaId: string, data: any) => {
    const res = await fetch(`${API_URL}/turmas/${turmaId}/alunos/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'userid': currentUser?.id || '' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao adicionar aluno');
    }
    await loadData(currentUser?.role);
    return await res.json();
  };

  const uploadAlunos = async (turmaId: string, formData: FormData) => {
    const res = await fetch(`${API_URL}/turmas/${turmaId}/alunos/upload`, {
      method: 'POST', body: formData
    });
    if (!res.ok) throw new Error("Erro ao enviar arquivo");
    const data = await res.json();
    await loadData(currentUser?.role);
    return data;
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, cursos, turmas, categorias, provas, capacidades, conhecimentos, atividades, submissoes,
      login, logout, registerUser, addCurso, addCategoria, updateCategoria, deleteCategoria, addProva, addCapacidade, addConhecimento, addAtividade, addSubmissao, scoreSubmissao, addTurma, deleteTurma, togglePodeCriarTurma, uploadAlunos, addAlunoTurma, vincularAlunos, clonarProva, toggleProvaAtiva, atualizarPinProva }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
