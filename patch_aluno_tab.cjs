const fs = require('fs');
const path = 'src/pages/Aluno.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add "correcoes" to activeTab state if not there (it's typed as string so we don't strictly need to change the type if it's not strictly typed to 'dashboard'|'ranking', let's check).
// The state is: const [activeTab, setActiveTab] = useState<'dashboard' | 'ranking'>('dashboard');
content = content.replace(
  "useState<'dashboard' | 'ranking'>('dashboard')",
  "useState<'dashboard' | 'ranking' | 'correcoes'>('dashboard')"
);

// Add the tab button
const tabsAnchor = "<button className={`pb-2 px-4 ${activeTab === 'ranking' ? 'border-b-2 border-blue-500 text-white font-bold' : 'text-gray-500'}`} onClick={() => setActiveTab('ranking')}>Ranking</button>";
const correctionsTabBtn = "\n        <button className={`pb-2 px-4 ${activeTab === 'correcoes' ? 'border-b-2 border-blue-500 text-white font-bold' : 'text-gray-500'}`} onClick={() => setActiveTab('correcoes')}>Gabaritos & Correções</button>";
if (!content.includes('Gabaritos & Correções')) {
    content = content.replace(tabsAnchor, tabsAnchor + correctionsTabBtn);
}

// Add the tab content right before {activeTab === 'ranking' && (
const rankingAnchor = "{activeTab === 'ranking' && (";
const correcoesContent = `
      {activeTab === 'correcoes' && (
        <div className="bg-[#1a2235] p-6 rounded-xl border border-gray-800 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Correções das Avaliações</h2>
          
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Selecione uma prova já concluída</label>
            <select onChange={(e) => {
              const provaId = e.target.value;
              if (provaId) {
                setActiveProvaId(provaId);
                setIsReviewing(true);
                setIsFinished(true); // Ensures the review UI from the other flow works if needed, but we can also render it directly here.
              }
            }} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white">
              <option value="">-- Selecione --</option>
              {provas.filter(p => p.ativa).map(prova => {
                const pAtivs = atividades.filter(a => a.provaId === prova.id);
                if (pAtivs.length === 0) return null;
                const completed = pAtivs.filter(a => minhasSubmissoes.some(s => s.atividadeId === a.id)).length;
                if (completed < pAtivs.length) return null; // Only fully completed exams
                return <option key={prova.id} value={prova.id}>{prova.title}</option>;
              })}
            </select>
          </div>

          <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-lg text-center">
            <Eye className="w-12 h-12 text-blue-500 mx-auto mb-3 opacity-50" />
            <p className="text-gray-400">Selecione uma avaliação no menu acima para ler os gabaritos comentados pelo professor, ver suas respostas e estudar pelos seus erros!</p>
          </div>
        </div>
      )}
`;
// Wait, if I set activeProvaId, isFinished, isReviewing to true, the MAIN component flow kicks in and returns the Review screen, hiding the dashboard completely!
// That is PERFECT. Because it acts like opening the review screen, and when they click "Voltar ao QG" or "Voltar ao Radar", it drops them back, they can just click the tab again.
// Let's add the code block.

if (!content.includes('activeTab === \'correcoes\'')) {
    content = content.replace(rankingAnchor, correcoesContent + "\n      " + rankingAnchor);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Correcoes tab added to Aluno.tsx');
