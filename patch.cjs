const fs = require('fs');
const path = 'src/pages/Professor.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "{ id: 'MULTIPLA_ESCOLHA', title: 'Múltipla Escolha'",
  "{ id: 'SAEP', title: 'SAEP', icon: FileText, desc: 'Contexto, Comando e Alternativas.', cat: 'Geral' },\n  { id: 'MULTIPLA_ESCOLHA', title: 'Múltipla Escolha'"
);

if (!content.includes("'SAEP'")) {
    content = content.replace(
      "{ id: 'MULTIPLA_ESCOLHA'",
      "{ id: 'SAEP', title: 'SAEP', icon: FileText, desc: 'Contexto, Comando e Alternativas.', cat: 'Geral' },\n  { id: 'MULTIPLA_ESCOLHA'"
    );
}

content = content.replace(
  "export type SubAba = 'nova_prova' | 'todas_avaliacoes' | 'lancar_atividade' | 'turmas' | 'cadastrar_alunos' | 'avaliar' | 'ranking';",
  "export type SubAba = 'nova_prova' | 'todas_avaliacoes' | 'lancar_atividade' | 'turmas' | 'cadastrar_alunos' | 'avaliar' | 'ranking' | 'explicacoes_saep';"
);

const stateAnchor = "const [title, setTitle] = useState('');";
const statesToAdd = `
  const [saepContexto, setSaepContexto] = useState('');
  const [saepComando, setSaepComando] = useState('');
  const [saepExplicacao, setSaepExplicacao] = useState('');
`;
content = content.replace(stateAnchor, stateAnchor + statesToAdd);

const resetAnchor = "setExpectedCode('');";
content = content.replace(resetAnchor, resetAnchor + " setSaepContexto(''); setSaepComando(''); setSaepExplicacao('');");

const configDataAnchor = "if (type === 'MULTIPLA_ESCOLHA') configData = { options, correct: correctOption };";
content = content.replace(configDataAnchor, "if (type === 'SAEP') configData = { contexto: saepContexto, comando: saepComando, options, correct: correctOption, explicacao: saepExplicacao };\n    else " + configDataAnchor);

const btnAnchor = "<button className={`px-3 py-1 rounded text-sm ${subAbaAtiva === 'avaliar' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setSubAbaAtiva('avaliar')}>Avaliar Alunos</button>";
const btnToAdd = "\n            <button className={`px-3 py-1 rounded text-sm ${subAbaAtiva === 'explicacoes_saep' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setSubAbaAtiva('explicacoes_saep')}>Explicações SAEP</button>";
content = content.replace(btnAnchor, btnAnchor + btnToAdd);

const formAnchor = "{type === 'MULTIPLA_ESCOLHA' && (";
const saepForm = `
                {type === 'SAEP' && (
                  <div className="space-y-4 mt-4 border-t border-gray-700 pt-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Contexto</label>
                      <textarea value={saepContexto} onChange={e => setSaepContexto(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white h-24 text-sm" required />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Comando (Pergunta/Instrução)</label>
                      <textarea value={saepComando} onChange={e => setSaepComando(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white h-16 text-sm" required />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm text-gray-400 mb-1">Alternativas</label>
                      {options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input type="radio" name="saepCorrectOption" checked={correctOption === i} onChange={() => setCorrectOption(i)} />
                          <input type="text" value={opt} onChange={e => {
                            const newOpts = [...options];
                            newOpts[i] = e.target.value;
                            setOptions(newOpts);
                          }} className="flex-1 bg-gray-900 border border-gray-700 rounded p-1 text-white text-sm" placeholder={\`Alternativa \${i + 1}\`} required />
                          {options.length > 2 && (
                            <button type="button" onClick={() => setOptions(options.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-400 font-bold px-2">X</button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => setOptions([...options, ''])} className="text-blue-400 hover:text-blue-300 text-xs mt-2">+ Adicionar Alternativa</button>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Explicação da Questão (Aparecerá na aba Explicações SAEP)</label>
                      <textarea value={saepExplicacao} onChange={e => setSaepExplicacao(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white h-20 text-sm" required />
                    </div>
                  </div>
                )}
`;
content = content.replace(formAnchor, saepForm + "\n                " + formAnchor);

const abaAnchor = "{subAbaAtiva === 'cadastrar_alunos' && !currentUser?.podeCriarTurma && (";
const explicacoesTab = `

      {subAbaAtiva === 'explicacoes_saep' && (
        <div className="bg-[#1a2235] p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-6">Explicações das Questões SAEP</h2>
          
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-1">Selecione uma Prova com questões SAEP</label>
            <select value={provaVisualizacaoId || ''} onChange={e => setProvaVisualizacaoId(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white">
              <option value="">-- Selecione a Avaliação --</option>
              {provas.filter(p => atividades.some(a => a.provaId === p.id && a.type === 'SAEP')).map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {provaVisualizacaoId && (
            <div className="space-y-6">
              {atividades.filter(a => a.provaId === provaVisualizacaoId && a.type === 'SAEP').length === 0 ? (
                <p className="text-gray-500 italic">Nenhuma questão modelo SAEP encontrada nesta prova.</p>
              ) : (
                atividades.filter(a => a.provaId === provaVisualizacaoId && a.type === 'SAEP').map((ativ, idx) => {
                  let cfg: any = {};
                  try { cfg = JSON.parse(ativ.configData || '{}'); } catch(e){}
                  return (
                    <div key={ativ.id} className="bg-gray-800 p-4 rounded border border-gray-700">
                      <div className="flex gap-2 items-start mb-4">
                        <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">{idx + 1}</div>
                        <div>
                          <h4 className="text-lg font-bold text-white">{ativ.title || 'Questão SAEP'}</h4>
                          <p className="text-sm text-gray-400 mt-2"><strong className="text-gray-300">Contexto:</strong><br/>{cfg.contexto}</p>
                          <p className="text-sm text-white mt-3 font-semibold"><strong className="text-gray-300 font-normal">Comando:</strong><br/>{cfg.comando}</p>
                        </div>
                      </div>
                      
                      <div className="ml-10 space-y-2 mb-4">
                        <strong className="text-gray-300 text-sm">Alternativas:</strong>
                        {cfg.options && cfg.options.map((opt: string, oIdx: number) => (
                          <div key={oIdx} className={\`p-2 rounded text-sm border \${oIdx === cfg.correct ? 'bg-green-900/30 border-green-500/50 text-green-300 font-bold' : 'bg-gray-900 border-gray-700 text-gray-300'}\`}>
                            {String.fromCharCode(65 + oIdx)}) {opt} {oIdx === cfg.correct && '✓ Correta'}
                          </div>
                        ))}
                      </div>

                      <div className="ml-10 bg-blue-900/20 border border-blue-500/30 p-4 rounded mt-4">
                        <strong className="text-blue-300 block mb-1">Explicação da Questão:</strong>
                        <p className="text-sm text-gray-300">{cfg.explicacao || 'Nenhuma explicação fornecida para esta questão.'}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
`;
content = content.replace(abaAnchor, explicacoesTab + "\n      " + abaAnchor);

fs.writeFileSync(path, content, 'utf8');
console.log('Patch successfully applied');
