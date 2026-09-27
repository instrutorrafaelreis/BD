const fs = require('fs');
let c = fs.readFileSync('prisma/schema.prisma', 'utf8');

c = c.replace('  turmas      Turma[]\\n}', '  turmas      Turma[]\n}');
c = c.replace('  turmas      Prova_Turma[]\\n}', '  turmas      Prova_Turma[]\n}');

fs.writeFileSync('prisma/schema.prisma', c);
