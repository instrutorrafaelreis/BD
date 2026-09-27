import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { CapacidadeTipo } from '../types';

export const Admin: React.FC = () => {
  const { users, cursos, turmas, addTurma, deleteTurma, categorias, deleteCategoria, addCategoria, updateUser, capacidades, conhecimentos, addCurso, addCapacidade, addConhecimento, registerUser, togglePodeCriarTurma } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'base' | 'users' | 'turmas'>('base');
  
  const [cursoName, setCursoName] = useState('');
  const [cursoCategoriaId, setCursoCategoriaId] = useState('');

  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('Folder');
  const [catColor, setCatColor] = useState('blue-500');
  const [capName, setCapName] = useState('');
  const [capType, setCapType] = useState<CapacidadeTipo>('Básica');
  const [conName, setConName] = useState('');

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [uName, setUName] = useState('');
  const [uUsername, setUUsername] = useState('');
  const [uPassword, setUPassword] = useState('');
  const [uRole, setURole] = useState('professor');

  const [turmaName, setTurmaName] = useState('');
  const [turmaCodigo, setTurmaCodigo] = useState('');
  const [turmaProfId, setTurmaProfId] = useState('');

  const handleAddTurma = (e: React.FormEvent) => {
    e.preventDefault();
    if (turmaName.trim() && turmaCodigo.trim() && turmaProfId) {
      addTurma({ name: turmaName, codigo: turmaCodigo, professorId: turmaProfId });
      setTurmaName(''); setTurmaCodigo(''); setTurmaProfId('');
    }
  };

  const handleAddCurso = (e: React.FormEvent) => {
    e.preventDefault();
    if (cursoName.trim()) {
      addCurso(cursoName, cursoCategoriaId || undefined);
      setCursoName('');
      setCursoCategoriaId('');
    }
  };

  const handleAddCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (catName.trim()) {
      await addCategoria({ nome: catName, icone: catIcon, cor: catColor });
      setCatName('');
      setCatIcon('Folder');
      setCatColor('blue-500');
    }
  };

  const handleAddCapacidade = (e: React.FormEvent) => {
    e.preventDefault();
    if (capName.trim()) {
      addCapacidade({ name: capName, type: capType });
      setCapName('');
    }
  };

  const handleAddConhecimento = (e: React.FormEvent) => {
    e.preventDefault();
    if (conName.trim()) {
      addConhecimento({ name: conName });
      setConName('');
    }
  };

  
  const handleEditClick = (u: any) => {
    setEditingUserId(u.id);
    setUName(u.name);
    setUUsername(u.username);
    setUPassword('');
    setURole(u.role);
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setUName(''); setUUsername(''); setUPassword(''); setURole('aluno');
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        await updateUser(editingUserId, { name: uName, username: uUsername, role: uRole, password: uPassword || undefined });
        alert('Usuário atualizado com sucesso!');
        cancelEdit();
      } else {
        await registerUser(uName, uUsername, uPassword, uRole);
        alert('Usuário criado com sucesso!');
        setUName(''); setUUsername(''); setUPassword(''); setURole('aluno');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerUser(uName, uUsername, uPassword, uRole);
      setUName(''); setUUsername(''); setUPassword('');
      alert("Usuário cadastrado com sucesso!");
    } catch (e) {
      alert("Erro ao cadastrar. O nome de usuário já pode estar em uso.");
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-blue-400">Painel do Administrador</h1>
      
      <div className="flex gap-4 border-b border-gray-800 pb-2">
        <button className={`pb-2 px-4 ${activeTab === 'base' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-500'}`} onClick={() => setActiveTab('base')}>Estrutura Base</button>
        <button className={`pb-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-500'}`} onClick={() => setActiveTab('users')}>Gerenciar Usuários</button>
        <button className={`pb-2 px-4 ${activeTab === 'turmas' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-500'}`} onClick={() => setActiveTab('turmas')}>Turmas</button>
      </div>

      {activeTab === 'base' && (
        <>
        {/* Cursos */}
        {/* Categorias */}
        <div className="bg-[#1a2235] p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Categorias de Curso</h2>
          <form onSubmit={handleAddCategoria} className="mb-4 flex flex-col gap-2">
            <input 
              type="text" 
              value={catName}
              onChange={e => setCatName(e.target.value)}
              placeholder="Nome da Categoria (Ex: Tecnologia)"
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
              required
            />
            <div className="flex gap-2">
              <select value={catColor} onChange={e => setCatColor(e.target.value)} className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-white">
                <option value="blue-500">Azul</option>
                <option value="green-500">Verde</option>
                <option value="purple-500">Roxo</option>
                <option value="orange-500">Laranja</option>
                <option value="pink-500">Rosa</option>
                <option value="red-500">Vermelho</option>
              </select>
              <select value={catIcon} onChange={e => setCatIcon(e.target.value)} className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-white">
                <option value="Folder">Pasta</option>
                <option value="Code">Código</option>
                <option value="Briefcase">Maleta</option>
                <option value="FlaskConical">Ciência</option>
                <option value="Users">Humanas</option>
                <option value="Languages">Linguagens</option>
                <option value="HeartPulse">Saúde</option>
              </select>
              <button type="submit" className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700">+</button>
            </div>
          </form>
          <ul className="space-y-2">
            {categorias.map(cat => (
              <li key={cat.id} className="bg-gray-800 p-2 rounded text-gray-300 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full bg-${cat.cor}`}></span>
                  <span>{cat.nome}</span></div>
                <button onClick={() => { if(window.confirm('Excluir categoria? Cursos associados ficarão sem categoria.')) deleteCategoria(cat.id); }} className="text-red-500 hover:text-red-400 text-sm">Excluir</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Cursos */}
        <div className="bg-[#1a2235] p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Cursos</h2>
          <form onSubmit={handleAddCurso} className="mb-4 flex flex-col gap-2">
            <input 
              type="text" 
              value={cursoName}
              onChange={e => setCursoName(e.target.value)}
              placeholder="Nome do Curso"
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
              required
            />
            <div className="flex gap-2">
              <select value={cursoCategoriaId} onChange={e => setCursoCategoriaId(e.target.value)} className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-white">
                <option value="">Sem Categoria</option>
                {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
              </select>
              <button type="submit" className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700">+</button>
            </div>
          </form>
          <ul className="space-y-2">
            {cursos.map(c => {
              const cat = categorias.find(cat => cat.id === c.categoriaId);
              return (
              <li key={c.id} className="bg-gray-800 p-2 rounded text-gray-300 flex items-center justify-between">
                <span>{c.name}</span>
                {cat && <span className={`text-xs px-2 py-0.5 rounded border border-${cat.cor} text-${cat.cor}`}>{cat.nome}</span>}
              </li>
            )})}
          </ul>
        </div>

        {/* Capacidades */}
        <div className="bg-[#1a2235] p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Capacidades</h2>
          <form onSubmit={handleAddCapacidade} className="mb-4 flex flex-col gap-2">
            <input 
              type="text" 
              value={capName}
              onChange={e => setCapName(e.target.value)}
              placeholder="Nome da Capacidade"
              className="bg-gray-900 border border-gray-700 rounded p-2 text-white"
            />
            <div className="flex gap-2">
              <select 
                value={capType} 
                onChange={e => setCapType(e.target.value as CapacidadeTipo)}
                className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-white"
              >
                <option value="Básica">Básica</option>
                <option value="Técnica">Técnica</option>
                <option value="Socioemocional">Socioemocional</option>
              </select>
              <button type="submit" className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700">+</button>
            </div>
          </form>
          <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {capacidades.map(c => (
              <li key={c.id} className="bg-gray-800 p-2 rounded text-gray-300 flex justify-between items-center text-sm">
                <span>{c.name}</span>
                <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-400">{c.type}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Conhecimentos */}
        <div className="bg-[#1a2235] p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Conhecimentos</h2>
          <form onSubmit={handleAddConhecimento} className="mb-4 flex gap-2">
            <input 
              type="text" 
              value={conName}
              onChange={e => setConName(e.target.value)}
              placeholder="Nome do Conhecimento"
              className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-white"
            />
            <button type="submit" className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700">+</button>
          </form>
          <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {conhecimentos.map(c => (
              <li key={c.id} className="bg-gray-800 p-2 rounded text-gray-300 text-sm">{c.name}</li>
            ))}
          </ul>
        </div>
      </>
      )}

      {activeTab === 'users' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#1a2235] p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">{editingUserId ? "Editar Usuário" : "Cadastrar Usuário"}</h2>
            <form onSubmit={handleSubmitUser} className="space-y-4">
              <div>
                <input type="text" placeholder="Nome Completo" value={uName} onChange={e => setUName(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" required />
              </div>
              <div>
                <input type="text" placeholder="Nome de Usuário (Login)" value={uUsername} onChange={e => setUUsername(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" required />
              </div>
              <div>
                <input type="password" placeholder={editingUserId ? "Nova Senha (deixe em branco para manter)" : "Senha"} value={uPassword} onChange={e => setUPassword(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" required={!editingUserId} />
              </div>
              <div>
                <select value={uRole} onChange={e => setURole(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white">
                  <option value="professor">Professor</option>
                  <option value="aluno">Aluno</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex gap-2">
    <button type="submit" className="flex-1 bg-blue-600 px-4 py-2 rounded text-white font-bold hover:bg-blue-700">
      {editingUserId ? "Salvar Alterações" : "Criar Usuário"}
    </button>
    {editingUserId && (
      <button type="button" onClick={cancelEdit} className="bg-gray-600 px-4 py-2 rounded text-white font-bold hover:bg-gray-700">
        Cancelar
      </button>
    )}
  </div>
            </form>
          </div>
          
          <div className="bg-[#1a2235] p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Usuários Cadastrados</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.map(u => (
                <div key={u.id} className="bg-gray-800 p-3 rounded flex justify-between items-center">
    <div>
                    <p className="text-white font-bold">{u.name}</p>
                    <p className="text-xs text-gray-400">@{u.username}</p>
                    {u.role === 'professor' && (
                      <label className="flex items-center gap-2 mt-2 text-xs text-gray-300">
                        <input type="checkbox" checked={u.podeCriarTurma || false} onChange={e => togglePodeCriarTurma(u.id, e.target.checked)} /> Pode criar turmas
                      </label>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
     <button type="button" onClick={() => handleEditClick(u)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">Editar</button>
     <span className={`text-xs px-2 py-1 rounded uppercase ${u.role === 'admin' ? 'bg-red-900/30 text-red-400' : u.role === 'professor' ? 'bg-purple-900/30 text-purple-400' : 'bg-green-900/30 text-green-400'}`}>
                    {u.role}
                  </span></div></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'turmas' && (
        <div className="bg-[#1a2235] p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Gerenciar Turmas</h2>
          <form onSubmit={handleAddTurma} className="mb-4 flex flex-col gap-2">
            <input type="text" value={turmaName} onChange={e => setTurmaName(e.target.value)} placeholder="Nome da Turma" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" required />
            <input type="text" value={turmaCodigo} onChange={e => setTurmaCodigo(e.target.value)} placeholder="Código" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" required />
            <div className="flex gap-2">
              <select value={turmaProfId} onChange={e => setTurmaProfId(e.target.value)} className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-white" required>
                <option value="">Selecione o Professor</option>
                {users.filter(u => u.role === 'professor').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button type="submit" className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700">Criar</button>
            </div>
          </form>
          <ul className="space-y-2">
            {turmas.map(t => (
              <li key={t.id} className="bg-gray-800 p-2 rounded text-gray-300 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white">{t.name}</span> <span className="text-gray-500 text-sm">({t.codigo})</span>
                  <p className="text-xs text-gray-400">Professor: {users.find(u => u.id === t.professorId)?.name}</p>
                </div>
                <button onClick={() => { if(window.confirm('Excluir turma?')) deleteTurma(t.id); }} className="text-red-500 hover:text-red-400 text-sm">Excluir</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
