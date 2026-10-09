const fs = require('fs');
const path = 'src/pages/Professor.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/\\\$\{type === qt\.id/g, "${type === qt.id");

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed escaped interpolation in Professor.tsx');
