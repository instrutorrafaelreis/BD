const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const defaults = [
    { nome: 'Tecnologia', icone: 'Code', cor: 'blue-500' },
    { nome: 'Gestão', icone: 'Briefcase', cor: 'orange-500' },
    { nome: 'Ciências', icone: 'FlaskConical', cor: 'green-500' },
    { nome: 'Humanas', icone: 'Users', cor: 'purple-500' },
    { nome: 'Linguagens', icone: 'Languages', cor: 'pink-500' },
    { nome: 'Saúde', icone: 'HeartPulse', cor: 'red-500' }
  ];

  for (const c of defaults) {
    const existing = await prisma.categoria.findUnique({ where: { nome: c.nome } });
    if (!existing) {
      await prisma.categoria.create({ data: c });
    }
  }
  console.log('Categorias inseridas!');
}
run();
