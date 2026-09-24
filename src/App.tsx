import { HashRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Game } from './pages/Game';
import { Result } from './pages/Result';
import { Teacher } from './pages/Teacher';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-[#0a0f1d] text-white overflow-hidden flex flex-col font-sans">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/result" element={<Result />} />
          <Route path="/teacher" element={<Teacher />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
