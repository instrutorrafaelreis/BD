const fs = require('fs');
const path = 'src/pages/Aluno.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add isReviewing state
const stateAnchor = "const [isFinished, setIsFinished] = useState(false);";
const stateToAdd = "\n  const [isReviewing, setIsReviewing] = useState(false);";
content = content.replace(stateAnchor, stateAnchor + stateToAdd);

// 2. Reset isReviewing on handleStartProva
const resetAnchor = "setFeedbackToast(null); setShowChests(false);";
content = content.replace(resetAnchor, resetAnchor + " setIsReviewing(false);");

// 3. Patch the isFinished view to include Gabarito and Review screen
const isFinishedAnchor = "if (isFinished) {";
const isFinishedBlock = `
    if (isFinished) {
      if (isReviewing) {
        return (
          <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-[#1a2235] p-6 rounded-2xl border border-gray-800">
              <h1 className="text-2xl font-black text-white">Gabarito Comentado</h1>
              <button onClick={() => setIsReviewing(false)} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all">Voltar ao Radar</button>
            </div>
            
            <div className="space-y-6">
              {activeProvaAtividades.map((ativ, index) => {
                const sub = minhasSubmissoes.find(s => s.atividadeId === ativ.id);
                const cfg = ativ.configData ? JSON.parse(ativ.configData) : {};
                const isCorrect = sub && sub.score && sub.score > 0; // simplistic assumption for now
                let studentAnswer = 'Nenhuma resposta';
                try {
                  const ansObj = JSON.parse(sub?.answerText || '{}');
                  if (ansObj.selected !== undefined) studentAnswer = \`Alternativa \${String.fromCharCode(65 + ansObj.selected)}\`;
                  else if (ansObj.code) studentAnswer = 'Código enviado';
                  else if (ansObj.text) studentAnswer = ansObj.text;
                  else studentAnswer = sub?.answerText || 'Sem resposta';
                } catch(e) {
                  studentAnswer = sub?.answerText || 'Sem resposta';
                }

                return (
                  <div key={ativ.id} className={\`p-6 rounded-2xl border \${isCorrect ? 'bg-green-900/10 border-green-500/30' : 'bg-red-900/10 border-red-500/30'}\`}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="bg-gray-800 text-gray-300 w-8 h-8 rounded-full flex items-center justify-center text-sm">{index + 1}</span>
                        {ativ.title}
                      </h3>
                      <span className={\`font-bold px-3 py-1 rounded-full text-xs \${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}\`}>
                        {isCorrect ? 'Acertou' : 'Errou'}
                      </span>
                    </div>
                    
                    {ativ.type === 'SAEP' && (
                      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 mb-4 text-sm text-gray-300">
                        <p className="mb-2"><strong className="text-blue-400">Contexto:</strong> {cfg.contexto}</p>
                        <p><strong className="text-blue-400">Comando:</strong> {cfg.comando}</p>
                      </div>
                    )}
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <strong className="text-gray-400 block mb-1">Sua Resposta:</strong>
                        <p className="text-white">{studentAnswer}</p>
                      </div>
                      <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/20">
                        <strong className="text-blue-400 block mb-1">Gabarito:</strong>
                        <p className="text-white">
                           {cfg.correct !== undefined && cfg.options ? \`Alternativa \${String.fromCharCode(65 + cfg.correct)}\` : 'Verifique a explicação'}
                        </p>
                      </div>
                    </div>

                    {(cfg.explicacao || ativ.type === 'SAEP') && (
                      <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg text-sm">
                        <strong className="text-yellow-500 block mb-1"><HelpCircle className="w-4 h-4 inline mr-1" /> Explicação do Professor:</strong>
                        <p className="text-gray-300">{cfg.explicacao || 'Nenhuma explicação detalhada cadastrada para esta questão.'}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

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
                  <div className="w-full bg-gray-800 rounded-full h-3"><div className="bg-blue-500 h-3 rounded-full transition-all duration-1000" style={{ width: \`\${p.percent}%\` }}></div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setIsReviewing(true)} className="px-8 py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 border border-gray-600 transition-all flex items-center gap-2"><Eye className="w-5 h-5"/> Ver Gabarito Comentado</button>
            <button onClick={() => { setActiveProvaId(null); setProgresso(null); setIsFinished(false); }} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all">Voltar ao QG</button>
          </div>
        </div>
      );
    }
`;
// Replace the entire if(isFinished) { ... } block
// We need to carefully slice it. Let's find the boundaries.
let modifiedContent = content;
const matchStart = content.indexOf("if (isFinished) {");
const matchEnd = content.indexOf("if (!currentAtividade) return null;");
if (matchStart !== -1 && matchEnd !== -1) {
    modifiedContent = content.slice(0, matchStart) + isFinishedBlock + "\n\n    " + content.slice(matchEnd);
}

// 4. Improve Dashboard header to show Level
const dashboardHeaderStart = "<div><h1 className=\"text-3xl font-bold text-blue-400\">Área do Aluno</h1></div>";
const dashboardHeaderReplacement = `
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gray-800 rounded-2xl border-2 border-blue-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
             <span className="text-3xl font-black text-white">{Math.floor(myTotalXP / 500) + 1}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Bem-vindo, {currentUser?.name}!</h1>
            <p className="text-blue-400 font-bold text-sm uppercase tracking-widest">Nível {Math.floor(myTotalXP / 500) + 1} • Aprendiz</p>
            <div className="w-48 bg-gray-800 rounded-full h-2 mt-2 border border-gray-700">
               <div className="bg-blue-500 h-2 rounded-full" style={{ width: \`\${((myTotalXP % 500) / 500) * 100}%\` }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{500 - (myTotalXP % 500)} XP para o próximo nível</p>
          </div>
        </div>
`;
modifiedContent = modifiedContent.replace(dashboardHeaderStart, dashboardHeaderReplacement);

fs.writeFileSync(path, modifiedContent, 'utf8');
console.log('Aluno.tsx upgraded successfully');
