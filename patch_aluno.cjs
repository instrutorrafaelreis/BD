const fs = require('fs');
const path = 'src/pages/Aluno.tsx';
let content = fs.readFileSync(path, 'utf8');

const target1 = "if (currentAtividade.type === 'MULTIPLA_ESCOLHA' || (currentAtividade.type === 'PREDICT_OUTPUT' && config.isMultipleChoice)) {";
const replacement1 = "if (currentAtividade.type === 'SAEP' || currentAtividade.type === 'MULTIPLA_ESCOLHA' || (currentAtividade.type === 'PREDICT_OUTPUT' && config.isMultipleChoice)) {";
content = content.replace(target1, replacement1);

const target2 = "{(currentAtividade.type === 'MULTIPLA_ESCOLHA' || (currentAtividade.type === 'PREDICT_OUTPUT' && config.isMultipleChoice)) && config.options && (";
const replacement2 = `
            {currentAtividade.type === 'SAEP' && (
              <div className="mb-6 bg-gray-800/80 p-5 rounded-xl border border-blue-500/30 shadow-lg">
                <h4 className="text-blue-400 text-sm font-black uppercase tracking-wider mb-2">Contexto</h4>
                <p className="text-gray-300 text-base mb-6 whitespace-pre-wrap leading-relaxed">{config.contexto}</p>
                <h4 className="text-blue-400 text-sm font-black uppercase tracking-wider mb-2">Comando</h4>
                <p className="text-white text-lg font-bold whitespace-pre-wrap leading-relaxed">{config.comando}</p>
              </div>
            )}

            {(currentAtividade.type === 'SAEP' || currentAtividade.type === 'MULTIPLA_ESCOLHA' || (currentAtividade.type === 'PREDICT_OUTPUT' && config.isMultipleChoice)) && config.options && (`;
content = content.replace(target2, replacement2);

fs.writeFileSync(path, content, 'utf8');
console.log('Aluno.tsx patched successfully');
