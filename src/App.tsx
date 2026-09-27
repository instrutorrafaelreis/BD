import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';
import { Professor } from './pages/Professor';
import { Aluno } from './pages/Aluno';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { currentUser } = useAppContext();
  
  if (!currentUser) return <Navigate to="/" />;
  if (!allowedRoles.includes(currentUser.role)) return <Navigate to="/" />;
  
  return (
    <>
      <Navigation />
      <div className="p-6 max-w-7xl mx-auto w-full">
        {children}
      </div>
    </>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Admin />
        </ProtectedRoute>
      } />
      <Route path="/professor" element={
        <ProtectedRoute allowedRoles={['professor']}>
          <Professor />
        </ProtectedRoute>
      } />
      <Route path="/aluno" element={
        <ProtectedRoute allowedRoles={['aluno']}>
          <Aluno />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <div className="min-h-screen bg-[#0a0f1d] text-white font-sans flex flex-col">
          <AppRoutes />
        </div>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
