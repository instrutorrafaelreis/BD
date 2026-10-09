const fs = require('fs');
const path = 'src/pages/Professor.tsx';
let content = fs.readFileSync(path, 'utf8');

// Hide Enunciado for SAEP
const targetDiv = '<div><label className="block text-sm text-gray-400 mb-1">Enunciado (Markdown)</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white h-24 font-mono text-sm" required /></div>';
const replacementDiv = "{type !== 'SAEP' && (\n                  <div><label className=\"block text-sm text-gray-400 mb-1\">Enunciado (Markdown)</label><textarea value={description} onChange={e => setDescription(e.target.value)} className=\"w-full bg-gray-900 border border-gray-700 rounded p-2 text-white h-24 font-mono text-sm\" required /></div>\n                )}";
if (content.includes(targetDiv)) {
    content = content.replace(targetDiv, replacementDiv);
}

// Ensure addAtividade uses saepComando as description if SAEP
const targetAdd = 'addAtividade({ title, description, type, configData: JSON.stringify({...configData, gamification}), professorId: currentUser!.id, provaId } as any);';
const replacementAdd = 'addAtividade({ title, description: type === \'SAEP\' ? saepComando : description, type, configData: JSON.stringify({...configData, gamification}), professorId: currentUser!.id, provaId } as any);';
if (content.includes(targetAdd)) {
    content = content.replace(targetAdd, replacementAdd);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Enunciado patched successfully');
