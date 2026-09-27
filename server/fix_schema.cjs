const fs = require('fs');
let c = fs.readFileSync('prisma/schema.prisma', 'utf8');

c = c.replace('matricula        String?\\n  podeCriarTurma   Boolean @default(false)', 'matricula        String?\n  podeCriarTurma   Boolean @default(false)');

fs.writeFileSync('prisma/schema.prisma', c);
