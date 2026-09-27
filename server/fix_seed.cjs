const fs = require('fs');
let c = fs.readFileSync('index.ts', 'utf8');

c = c.replace(
  "  await prisma.user.deleteMany();",
  `  await prisma.aluno_Turma.deleteMany();
  await prisma.prova_Turma.deleteMany();
  await prisma.turma.deleteMany();
  await prisma.progressoProva.deleteMany();
  await prisma.prova.deleteMany();
  await prisma.user.deleteMany();`
);

fs.writeFileSync('index.ts', c);
console.log('Fixed seed route delete order');
