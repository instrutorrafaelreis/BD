const fs = require('fs');
let content = fs.readFileSync('index.ts', 'utf8');

// 1. Update /api/cursos GET
content = content.replace(
  "const cursos = await prisma.curso.findMany();",
  "const cursos = await prisma.curso.findMany({ include: { categoria: true } });"
);

// 2. Update /api/cursos POST
content = content.replace(
  "const { name } = req.body;\r\n  const curso = await prisma.curso.create({ data: { name } });",
  "const { name, categoriaId } = req.body;\r\n  const curso = await prisma.curso.create({ data: { name, ...(categoriaId && {categoriaId}) } });"
);
content = content.replace(
  "const { name } = req.body;\n  const curso = await prisma.curso.create({ data: { name } });",
  "const { name, categoriaId } = req.body;\n  const curso = await prisma.curso.create({ data: { name, ...(categoriaId && {categoriaId}) } });"
);

// 3. Add Categorias endpoints
const catEndpoints = `// Categorias
app.get('/api/categorias', async (req, res) => {
  const categorias = await prisma.categoria.findMany();
  res.json(categorias);
});
app.post('/api/categorias', async (req, res) => {
  const { nome, icone, cor } = req.body;
  const cat = await prisma.categoria.create({ data: { nome, icone, cor } });
  res.json(cat);
});
app.put('/api/categorias/:id', async (req, res) => {
  const { nome, icone, cor } = req.body;
  const cat = await prisma.categoria.update({ where: { id: req.params.id }, data: { nome, icone, cor } });
  res.json(cat);
});
app.delete('/api/categorias/:id', async (req, res) => {
  await prisma.curso.updateMany({ where: { categoriaId: req.params.id }, data: { categoriaId: null } });
  await prisma.categoria.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// Cursos`;
content = content.replace("// Cursos", catEndpoints);

fs.writeFileSync('index.ts', content);

// Now update the seed function
let content2 = fs.readFileSync('index.ts', 'utf8');
const seedBlock = `    await prisma.atividade.deleteMany();\r
    await prisma.prova.deleteMany();\r
    await prisma.curso.deleteMany();`;
    
const newSeedBlock = `    await prisma.atividade.deleteMany();
    await prisma.prova.deleteMany();
    await prisma.curso.deleteMany();
    await prisma.categoria.deleteMany();

    const catTec = await prisma.categoria.create({ data: { nome: 'Tecnologia', icone: 'Code', cor: 'blue-500' } });
    const catGes = await prisma.categoria.create({ data: { nome: 'Gestão', icone: 'Briefcase', cor: 'orange-500' } });
    const catCie = await prisma.categoria.create({ data: { nome: 'Ciências', icone: 'FlaskConical', cor: 'green-500' } });
    const catHum = await prisma.categoria.create({ data: { nome: 'Humanas', icone: 'Users', cor: 'purple-500' } });
    const catLin = await prisma.categoria.create({ data: { nome: 'Linguagens', icone: 'Languages', cor: 'pink-500' } });
    const catSau = await prisma.categoria.create({ data: { nome: 'Saúde', icone: 'HeartPulse', cor: 'red-500' } });`;
content2 = content2.replace(seedBlock, newSeedBlock);

const seedBlock2 = `    await prisma.atividade.deleteMany();\n    await prisma.prova.deleteMany();\n    await prisma.curso.deleteMany();`;
content2 = content2.replace(seedBlock2, newSeedBlock);

// Also update the course creation in seed
content2 = content2.replace(
  "const curso = await prisma.curso.create({ data: { name: 'Desenvolvimento Web' } });",
  "const curso = await prisma.curso.create({ data: { name: 'Desenvolvimento Web', categoriaId: catTec.id } });"
);

fs.writeFileSync('index.ts', content2);
console.log('OK!');
