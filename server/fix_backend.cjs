const fs = require('fs');
let c = fs.readFileSync('index.ts', 'utf8');
c = c.replace(
  "import express from 'express';", 
  "import express from 'express';\nimport multer from 'multer';\nimport Papa from 'papaparse';\nimport * as xlsx from 'xlsx';\nimport crypto from 'crypto';"
);

// also fix typescript any types in relatorio if possible to avoid TS errors
c = c.replace(
  "const relatorio = { criados: 0, jaExistiam: 0, rejeitados: [], alertas: [] };",
  "const relatorio: { criados: number, jaExistiam: number, rejeitados: any[], alertas: any[] } = { criados: 0, jaExistiam: 0, rejeitados: [], alertas: [] };"
);

// e as of unknown
c = c.replace(
  "relatorio.rejeitados.push({ linha: linhaNum, motivo: 'Erro no banco: ' + e.message });",
  "relatorio.rejeitados.push({ linha: linhaNum, motivo: 'Erro no banco: ' + (e as any).message });"
);
c = c.replace(
  "return res.status(400).json({ error: 'Erro ao ler arquivo' });",
  "return res.status(400).json({ error: 'Erro ao ler arquivo: ' + (e as any).message });"
);

fs.writeFileSync('index.ts', c);
