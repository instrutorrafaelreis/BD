const fs = require('fs');
let c = fs.readFileSync('index.ts', 'utf8');

c = c.replace(
  "const payload = {",
  "const apiKey = process.env.NVIDIA_API_KEY;\n    if (!apiKey || apiKey === 'sua_chave_aqui') return res.status(500).json({ error: 'NVIDIA_API_KEY não configurada no servidor.' });\n\n    const payload = {"
);

fs.writeFileSync('index.ts', c);
console.log('Fixed API key check');
