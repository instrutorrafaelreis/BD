const fs = require('fs');
let c = fs.readFileSync('index.ts', 'utf8');

const putRoute = `
/**
 * @route PUT /api/users/:id
 * @desc Atualiza os dados básicos de um usuário
 * @access Admin
 */
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, username, role, password } = req.body;
  
  try {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (username && username !== existing.username) {
      const emailInUse = await prisma.user.findUnique({ where: { username } });
      if (emailInUse) {
        return res.status(409).json({ error: 'E-mail já está em uso.' });
      }
    }

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (username) dataToUpdate.username = username;
    if (role) dataToUpdate.role = role;
    if (password) dataToUpdate.password = password;

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuário.' });
  }
});
`;

c = c.replace(/app\.patch\('\/api\/users\/:id\/permissao-turma'/, putRoute + "\napp.patch('/api/users/:id/permissao-turma'");
fs.writeFileSync('index.ts', c);
