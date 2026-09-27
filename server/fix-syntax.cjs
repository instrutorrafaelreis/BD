const fs = require('fs');
let c = fs.readFileSync('index.ts', 'utf8');

c = c.replace(
  `        const apiKey = process.env.NVIDIA_API_KEY;\n    if (!apiKey || apiKey === 'sua_chave_aqui') return res.status(500).json({ error: 'NVIDIA_API_KEY não configurada no servidor.' });`,
  ""
);

c = c.replace(
  `    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "NVIDIA_API_KEY não configurada no servidor." });
    }`,
  `    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey || apiKey === 'sua_chave_aqui') {
      return res.status(500).json({ error: "NVIDIA_API_KEY não configurada no servidor." });
    }`
);

fs.writeFileSync('index.ts', c);
console.log('Fixed syntax error');
