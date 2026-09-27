import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, BookOpen } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { currentUser, logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentUser) return null;

  return (
    <nav className="bg-[#1a2235] p-4 flex justify-between items-center shadow-lg">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-400">
          <BookOpen className="w-6 h-6" />
          Plataforma Educacional
        </Link>
        <span className="text-gray-400 text-sm">
          {currentUser.role.toUpperCase()}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-gray-300">Olá, {currentUser.name}</span>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1.5 rounded hover:bg-red-500/30 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>
    </nav>
  );
};
