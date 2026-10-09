const fs = require('fs');
const path = 'src/pages/Aluno.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update student answer rendering
content = content.replace(
  "if (ansObj.selected !== undefined) studentAnswer = `Alternativa ${String.fromCharCode(65 + ansObj.selected)}`;",
  "if (ansObj.selected !== undefined) studentAnswer = `Alternativa ${String.fromCharCode(65 + ansObj.selected)} - ${cfg.options ? cfg.options[ansObj.selected] : ''}`;"
);

// Update correct answer rendering
content = content.replace(
  "{cfg.correct !== undefined && cfg.options ? `Alternativa ${String.fromCharCode(65 + cfg.correct)}` : 'Verifique a explicação'}",
  "{cfg.correct !== undefined && cfg.options ? `Alternativa ${String.fromCharCode(65 + cfg.correct)} - ${cfg.options[cfg.correct]}` : 'Verifique a explicação'}"
);

fs.writeFileSync(path, content, 'utf8');
console.log('Aluno.tsx answers UX patched');
