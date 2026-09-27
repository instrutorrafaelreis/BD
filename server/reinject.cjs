const fs = require('fs');
let c = fs.readFileSync('index.ts', 'utf8');

const routes = `
// ----------------------------------------------------------------------
// MÓDULO DE TURMA E UPLOAD
// ----------------------------------------------------------------------

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

app.post('/api/turmas', async (req, res) => {
  const { nome, cursoId, professorResponsavelId, userId } = req.body;
  if (!nome || !cursoId || !userId) return res.status(400).json({ error: 'Faltam dados' });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  let profId = professorResponsavelId;

  if (user.role === 'professor') {
    if (!user.podeCriarTurma) {
      return res.status(403).json({ error: 'Você não tem permissão para criar turmas. Solicite ao administrador.' });
    }
    profId = user.id;
  } else if (user.role === 'admin') {
    if (!profId) return res.status(400).json({ error: 'Professor responsável é obrigatório' });
  } else {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  try {
    const turma = await prisma.turma.create({
      data: {
        nome,
        cursoId,
        professorResponsavelId: profId,
        criadoPor: user.role.toUpperCase()
      },
      include: { curso: true, professorResponsavel: true }
    });
    res.json(turma);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar turma' });
  }
});

app.get('/api/turmas', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId obrigatório' });

  const user = await prisma.user.findUnique({ where: { id: String(userId) } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  try {
    if (user.role === 'admin') {
      const turmas = await prisma.turma.findMany({ include: { curso: true, professorResponsavel: true, _count: { select: { alunos: true } } } });
      return res.json(turmas);
    } else if (user.role === 'professor') {
      const turmas = await prisma.turma.findMany({
        where: { professorResponsavelId: user.id },
        include: { curso: true, professorResponsavel: true, _count: { select: { alunos: true } } }
      });
      return res.json(turmas);
    } else {
      return res.status(403).json({ error: 'Acesso negado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar turmas' });
  }
});

app.delete('/api/turmas/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.headers['userid'];
  
  const user = await prisma.user.findUnique({ where: { id: String(userId) } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  const turma = await prisma.turma.findUnique({ where: { id } });
  if (!turma) return res.status(404).json({ error: 'Turma não encontrada' });

  if (user.role === 'professor' && turma.professorResponsavelId !== user.id) {
    return res.status(403).json({ error: 'Você não é o responsável por esta turma' });
  }

  try {
    await prisma.turma.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar turma' });
  }
});

app.patch('/api/users/:id/permissao-turma', async (req, res) => {
  const { id } = req.params;
  const userId = req.headers['userid'];
  const { podeCriarTurma } = req.body;

  const admin = await prisma.user.findUnique({ where: { id: String(userId) } });
  if (!admin || admin.role !== 'admin') return res.status(403).json({ error: 'Apenas admins podem alterar permissões' });

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { podeCriarTurma }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao alterar permissão' });
  }
});

app.post('/api/usuarios/trocar-senha', async (req, res) => {
  const { userId, senhaAtual, novaSenha } = req.body;
  if (!novaSenha || novaSenha.length < 6) return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  
  if (user.password !== senhaAtual) {
    return res.status(401).json({ error: 'Senha atual incorreta' });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { password: novaSenha, senhaTemporaria: false }
  });

  res.json({ success: true });
});

app.post('/api/turmas/:turmaId/alunos/upload', upload.single('file'), async (req, res) => {
  const { turmaId } = req.params;
  const userId = req.headers['userid'];

  if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado' });

  const user = await prisma.user.findUnique({ where: { id: String(userId) } });
  const turma = await prisma.turma.findUnique({ where: { id: turmaId } });

  if (!user || !turma) return res.status(404).json({ error: 'Usuário ou Turma não encontrados' });

  if (user.role === 'professor' && turma.professorResponsavelId !== user.id) {
    return res.status(403).json({ error: 'Acesso negado: Você não é o professor responsável por esta turma' });
  }

  let data = [];
  try {
    if (req.file.originalname.endsWith('.csv')) {
      const csvStr = req.file.buffer.toString('utf8');
      const result = Papa.parse(csvStr, { header: true, skipEmptyLines: true });
      data = result.data;
    } else if (req.file.originalname.endsWith('.xlsx')) {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      data = xlsx.utils.sheet_to_json(sheet);
    } else {
      return res.status(400).json({ error: 'Formato inválido. Use .csv ou .xlsx' });
    }
  } catch(e) {
    return res.status(400).json({ error: 'Erro ao ler arquivo' });
  }

  const relatorio = { criados: 0, jaExistiam: 0, rejeitados: [], alertas: [] };
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const linhaNum = i + 2; 

    if (!row.nome || !row.nome.trim()) {
      relatorio.rejeitados.push({ linha: linhaNum, motivo: 'Nome vazio' });
      continue;
    }
    if (!row.email || !emailRegex.test(row.email)) {
      relatorio.rejeitados.push({ linha: linhaNum, motivo: 'E-mail inválido ou vazio' });
      continue;
    }

    try {
      await prisma.$transaction(async (tx) => {
        let aluno = await tx.user.findUnique({ where: { username: row.email } });
        
        if (aluno) {
          relatorio.jaExistiam++;
          if (row.id && String(row.id).trim() !== '' && aluno.matricula !== String(row.id)) {
            relatorio.alertas.push({ linha: linhaNum, motivo: 'Matrícula no arquivo não coincide com a do aluno existente' });
          }
        } else {
          if (row.id && String(row.id).trim() !== '') {
            const checkMatricula = await tx.user.findFirst({ where: { matricula: String(row.id) } });
            if (checkMatricula) {
              relatorio.alertas.push({ linha: linhaNum, motivo: 'Matrícula já usada por outro e-mail' });
            }
          }

          aluno = await tx.user.create({
            data: {
              name: row.nome.trim(),
              username: row.email.trim(),
              password: '123456',
              role: 'aluno',
              senhaTemporaria: true,
              matricula: row.id && String(row.id).trim() !== '' ? String(row.id) : null
            }
          });
          relatorio.criados++;
        }

        const vinculo = await tx.aluno_Turma.findUnique({
          where: { turmaId_alunoId: { turmaId, alunoId: aluno.id } }
        });

        if (!vinculo) {
          await tx.aluno_Turma.create({
            data: { turmaId, alunoId: aluno.id }
          });
        }
      });
    } catch(e) {
      relatorio.rejeitados.push({ linha: linhaNum, motivo: 'Erro no banco: ' + e.message });
    }
  }

  res.json(relatorio);
});
`;

c = c.replace(/app\.listen\(PORT/, routes + "\napp.listen(PORT");
fs.writeFileSync('index.ts', c);
