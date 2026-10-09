import OpenAI from 'openai';
import axios from 'axios';
import express from 'express';
import multer from 'multer';
import Papa from 'papaparse';
import * as xlsx from 'xlsx';
import crypto from 'crypto';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Users & Auth (Mock login)
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Categorias
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

// Cursos
app.get('/api/cursos', async (req, res) => {
  const cursos = await prisma.curso.findMany({ include: { categoria: true } });
  res.json(cursos);
});
app.post('/api/cursos', async (req, res) => {
  const { name, categoriaId } = req.body;
  const curso = await prisma.curso.create({ data: { name, ...(categoriaId && {categoriaId}) } });
  res.json(curso);
});

// Capacidades
app.get('/api/capacidades', async (req, res) => {
  const capacidades = await prisma.capacidade.findMany();
  res.json(capacidades);
});
app.post('/api/capacidades', async (req, res) => {
  const { name, type } = req.body;
  const capacidade = await prisma.capacidade.create({ data: { name, type } });
  res.json(capacidade);
});

// Conhecimentos
app.get('/api/conhecimentos', async (req, res) => {
  const conhecimentos = await prisma.conhecimento.findMany();
  res.json(conhecimentos);
});
app.post('/api/conhecimentos', async (req, res) => {
  const { name } = req.body;
  const conhecimento = await prisma.conhecimento.create({ data: { name } });
  res.json(conhecimento);
});

// Provas
app.get('/api/provas', async (req, res) => {
  const provas = await prisma.prova.findMany({ include: { turmas: true } });
  res.json(provas);
});
app.post('/api/provas', async (req, res) => {
  const { title, description, cursoId, professorId, turmaId } = req.body;
  const data: any = { title, description, cursoId, professorId };
  if (turmaId) {
    data.turmas = {
      create: [{ turmaId: turmaId }]
    };
  }
  const prova = await prisma.prova.create({ data });
  res.json(prova);
});

// Endpoint for Deep Copy / Clonagem
app.patch('/api/provas/:id/pin', async (req, res) => {
  const { id } = req.params;
  const { pin, userId } = req.body;
  
  if (!/^\d{4}$/.test(pin) || !userId) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }
  
  try {
    const prova = await prisma.prova.findUnique({ where: { id } });
    if (!prova) return res.status(404).json({ error: 'Prova não encontrada' });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (prova.professorId !== userId && user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    const updated = await prisma.prova.update({ where: { id }, data: { pin } });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/provas/:id/ativar', async (req, res) => {
  const { id } = req.params;
  const { ativa, userId } = req.body;
  if (typeof ativa !== 'boolean' || !userId) return res.status(400).json({ error: 'Parâmetros inválidos' });
  try {
    const prova = await prisma.prova.findUnique({ where: { id } });
    if (!prova) return res.status(404).json({ error: 'Prova não encontrada' });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (prova.professorId !== userId && user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    const updated = await prisma.prova.update({ where: { id }, data: { ativa } });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/provas/:id/clonar', async (req, res) => {
  const { id } = req.params;
  const { novaTurmaId } = req.body; 
  if (!novaTurmaId) return res.status(400).json({error: 'novaTurmaId obrigatório'});
  
  try {
    const original = await prisma.prova.findUnique({
      where: { id },
      include: { atividades: { include: { capacidades: true, conhecimentos: true } } }
    });
    if (!original) return res.status(404).json({error: 'Prova não encontrada'});

    const novaProva = await prisma.prova.create({
      data: {
        title: original.title + ' (Cópia)',
        description: original.description,
        cursoId: original.cursoId,
        professorId: original.professorId,
        turmas: {
          create: [{ turmaId: novaTurmaId }]
        }
      }
    });

    for (const ativ of original.atividades) {
      await prisma.atividade.create({
        data: {
          title: ativ.title,
          description: ativ.description,
          fileUrl: ativ.fileUrl,
          type: ativ.type,
          configData: ativ.configData,
          professorId: ativ.professorId,
          provaId: novaProva.id,
          capacidades: {
            create: ativ.capacidades.map(c => ({ capacidadeId: c.capacidadeId }))
          },
          conhecimentos: {
            create: ativ.conhecimentos.map(c => ({ conhecimentoId: c.conhecimentoId }))
          }
        }
      });
    }
    res.json({ success: true, novaProva });
  } catch(e: any) {
    res.status(500).json({error: e.message});
  }
});

// Helpers for Gamification
const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Atividades
app.get('/api/atividades', async (req, res) => {
  const { role } = req.query; // Send role to know if we should filter
  const atividades = await prisma.atividade.findMany({
    include: {
      capacidades: true,
      conhecimentos: true
    }
  });

  const formatted = atividades.map(a => {
    let configDataStr = a.configData;
    if (role === 'aluno' && a.configData) {
      try {
        const conf = JSON.parse(a.configData);
        // Omit answers for student
        if (conf.correct !== undefined) delete conf.correct;
        if (conf.expected !== undefined) delete conf.expected;
        if (conf.lines) conf.lines = shuffleArray([...conf.lines]);
        configDataStr = JSON.stringify(conf);
      } catch (e) {}
    }
    return {
      ...a,
      configData: configDataStr,
      capacidadeIds: a.capacidades.map(c => c.capacidadeId),
      conhecimentoIds: a.conhecimentos.map(c => c.conhecimentoId)
    };
  });
  res.json(formatted);
});

app.post('/api/atividades', async (req, res) => {
  const { title, description, provaId, professorId, capacidadeIds, conhecimentoIds, fileUrl, type, configData } = req.body;
  const atividade = await prisma.atividade.create({
    data: {
      title, description, provaId, professorId, fileUrl, type, configData,
      capacidades: {
        create: capacidadeIds.map((id: string) => ({ capacidadeId: id }))
      },
      conhecimentos: {
        create: conhecimentoIds.map((id: string) => ({ conhecimentoId: id }))
      }
    }
  });
  res.json(atividade);
});

// Progress
app.get('/api/progresso', async (req, res) => {
  const { alunoId, provaId } = req.query;
  if (!alunoId || !provaId) return res.status(400).json({ error: 'Missing ids' });
  let prog = await prisma.progressoProva.findUnique({
    where: { alunoId_provaId: { alunoId: String(alunoId), provaId: String(provaId) } }
  });
  if (!prog) {
    prog = await prisma.progressoProva.create({
      data: { alunoId: String(alunoId), provaId: String(provaId) }
    });
  }
  res.json(prog);
});

// Submissoes
app.get('/api/submissoes', async (req, res) => {
  const submissoes = await prisma.submissao.findMany();
  res.json(submissoes);
});

  app.post('/api/submissoes', async (req, res) => {
  const { atividadeId, alunoId, answerText, fileUrl, timeSpent, usedHint, bauEscolhido } = req.body;
  
  const atividade = await prisma.atividade.findUnique({ where: { id: atividadeId } });
  if (!atividade) return res.status(404).json({ error: 'Not found' });

  // Update or get progress
  const progresso = await prisma.progressoProva.upsert({
    where: { alunoId_provaId: { alunoId, provaId: atividade.provaId } },
    update: {},
    create: { alunoId, provaId: atividade.provaId }
  });

  let score = null;
  let feedback = null;
  let isCorrect = false;

  if (atividade.type !== 'UPLOAD' && atividade.configData) {
    try {
      const config = JSON.parse(atividade.configData);
      const answerObj = answerText ? JSON.parse(answerText) : {};
      
      let baseScore = config.xpBase || (config.nivelDificuldade === 'FACIL' ? 50 : config.nivelDificuldade === 'DIFICIL' ? 150 : config.nivelDificuldade === 'BOSS' ? 300 : 100);
      let partialMultiplier = 0;

      if (atividade.type === 'SAEP' || atividade.type === 'MULTIPLA_ESCOLHA' || (atividade.type === 'PREDICT_OUTPUT' && config.isMultipleChoice)) {
        if (answerObj.selected === config.correct) {
          isCorrect = true;
          partialMultiplier = 1;
        }
      } else if (atividade.type === 'COMPLETAR_CODIGO') {
        const expected = (config.expected || '').replace(/\s+/g, '').toLowerCase();
        const actual = (answerObj.code || '').replace(/\s+/g, '').toLowerCase();
        if (actual === expected) {
          isCorrect = true;
          partialMultiplier = 1;
        } else if (actual.includes(expected) || expected.includes(actual)) {
          partialMultiplier = 0.5;
        }
      } else if (atividade.type === 'CODIGO_EMBARALHADO' || atividade.type === 'SEQUENCIA_LOGICA') {
        const expected = config.lines || [];
        const actual = answerObj || [];
        if (JSON.stringify(expected) === JSON.stringify(actual)) {
          isCorrect = true;
          partialMultiplier = 1;
        } else {
          let correctPositions = 0;
          for (let i = 0; i < expected.length; i++) {
            if (expected[i] === actual[i]) correctPositions++;
          }
          partialMultiplier = correctPositions / (expected.length || 1);
        }
      } else if (atividade.type === 'DEBUG_CHALLENGE') {
        const expected = config.corrections || []; // {line, text}
        const actual = answerObj || [];
        if (JSON.stringify(expected) === JSON.stringify(actual)) {
          isCorrect = true;
          partialMultiplier = 1;
        }
      } else if (atividade.type === 'COMPLETE_FRASE') {
        const accepted = (config.acceptedAnswers || []).map((s: string) => s.trim().toLowerCase());
        const actual = (answerObj.text || '').trim().toLowerCase();
        if (accepted.includes(actual)) {
          isCorrect = true;
          partialMultiplier = 1;
        }
      } else if (atividade.type === 'DIAGRAMA_ASSOCIACAO') {
        const expected = config.pairs || [];
        const actual = answerObj || [];
        if (JSON.stringify(expected) === JSON.stringify(actual)) {
          isCorrect = true;
          partialMultiplier = 1;
        }
      } else if (atividade.type === 'PREDICT_OUTPUT') {
        const expected = (config.expectedOutput || '').trim();
        const actual = (answerObj.text || '').trim();
        if (expected === actual) {
          isCorrect = true;
          partialMultiplier = 1;
        }
      } else if (atividade.type === 'TERMINAL_SIMULADO') {
        const expected = (config.expectedCommand || '').trim();
        const actual = (answerObj.command || '').trim();
        if (expected === actual) {
          isCorrect = true;
          partialMultiplier = 1;
        }
      }

      if (partialMultiplier > 0) {
        let finalScore = baseScore * partialMultiplier;

        // Gamification Modifiers
        if (config.bonusVelocidade && timeSpent) {
          const limit = config.segundosLimite || 60;
          if (timeSpent <= limit * 0.25) {
            finalScore *= 1.5;
          } else if (timeSpent <= limit) {
            const slope = (1.0 - 1.5) / (limit - limit * 0.25);
            const multiplier = 1.5 + slope * (timeSpent - limit * 0.25);
            finalScore *= multiplier;
          }
        }

        if (usedHint && config.dicaDisponivel) {
          finalScore -= (config.custoXpDica || 10);
        }

        // Streak bonus
        if (isCorrect && progresso.streak >= 2) {
          finalScore += (progresso.streak * 5);
        }

        // Chest Mechanic (Baú Bônus)
        if (isCorrect && config.temBauBonus && bauEscolhido) {
           if (bauEscolhido.tipo === 'DOBRAR_XP') {
              finalScore *= 2;
           } else if (bauEscolhido.tipo === 'XP_FIXO') {
              finalScore += (bauEscolhido.valor || 50);
           } else if (bauEscolhido.tipo === 'PERDER_METADE') {
              finalScore /= 2;
           }
        }

        score = Math.max(0, Math.floor(finalScore));
        feedback = isCorrect ? 'Desafio superado!' : 'Quase lá, próxima!';
      } else {
        score = 0;
        feedback = 'Incorreto. A jornada continua!';
      }
    } catch (e) {
      console.log('Error parsing auto-grade config', e);
    }
  }

  // Persist Submissao
  let submissao;
  try {
    submissao = await prisma.submissao.create({
      data: { atividadeId, alunoId, answerText, fileUrl, score, feedback }
    });
  } catch (err) {
    // Unique constraint violation means already submitted
    return res.status(400).json({ error: 'Já submetido.' });
  }

  // Update Progress
  const newStreak = isCorrect ? progresso.streak + 1 : 0;
  const newXp = progresso.xpAccumulated + (score || 0);
  const newProgresso = await prisma.progressoProva.update({
    where: { id: progresso.id },
    data: { 
      streak: newStreak, 
      xpAccumulated: newXp,
      currentIndex: progresso.currentIndex + 1
    }
  });

  res.json({ submissao, progresso: newProgresso, isCorrect });
});

app.put('/api/submissoes/:id/score', async (req, res) => {
  const { id } = req.params;
  const { score, feedback } = req.body;
  const submissao = await prisma.submissao.update({
    where: { id },
    data: { score, feedback }
  });
  res.json(submissao);
});

// Auth routes
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  res.json(user);
});

app.post('/api/users', async (req, res) => {
  const { name, username, password, role, senhaTemporaria } = req.body;
  try {
    const user = await prisma.user.create({ data: { name, username, password, role, senhaTemporaria: senhaTemporaria || false } });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: 'Erro ao criar usuário, username pode já existir.' });
  }
});

// Seed Initial Data
app.post('/api/seed', async (req, res) => {
  // Clear DB
  await prisma.atividadeCapacidade.deleteMany();
  await prisma.atividadeConhecimento.deleteMany();
  await prisma.submissao.deleteMany();
  await prisma.atividade.deleteMany();
  await prisma.aluno_Turma.deleteMany();
  await prisma.prova_Turma.deleteMany();
  await prisma.turma.deleteMany();
  await prisma.progressoProva.deleteMany();
  await prisma.prova.deleteMany();
  await prisma.user.deleteMany();
  await prisma.capacidade.deleteMany();
  await prisma.conhecimento.deleteMany();
  await prisma.curso.deleteMany();

  // Create Users
  await prisma.user.create({ data: { id: '1', name: 'Administrador Geral', username: 'admin', password: '123', role: 'admin' } });
  await prisma.user.create({ data: { id: '2', name: 'Prof. Silva', username: 'profsilva', password: '123', role: 'professor' } });
  await prisma.user.create({ data: { id: '3', name: 'Aluno João', username: 'joao', password: '123', role: 'aluno' } });

  // Create Cursos
  await prisma.curso.create({ data: { id: 'c1', name: 'Desenvolvimento e Tecnologia' } });
  await prisma.curso.create({ data: { id: 'c2', name: 'Conhecimentos Gerais' } });

  // Create Capacidades
  await prisma.capacidade.create({ data: { id: 'cap1', name: 'Lógica e Matemática', type: 'Básica' } });
  await prisma.capacidade.create({ data: { id: 'cap2', name: 'Programação Web', type: 'Técnica' } });
  await prisma.capacidade.create({ data: { id: 'cap3', name: 'Interpretação de Texto', type: 'Socioemocional' } });
  await prisma.capacidade.create({ data: { id: 'cap4', name: 'Ciências Humanas', type: 'Básica' } });

  // Create Conhecimentos
  await prisma.conhecimento.create({ data: { id: 'con1', name: 'Programação' } });
  await prisma.conhecimento.create({ data: { id: 'con2', name: 'Matemática' } });
  await prisma.conhecimento.create({ data: { id: 'con3', name: 'História' } });
  await prisma.conhecimento.create({ data: { id: 'con4', name: 'Geografia' } });
  await prisma.conhecimento.create({ data: { id: 'con5', name: 'Inglês' } });
  await prisma.conhecimento.create({ data: { id: 'con6', name: 'Ciências' } });

  // Create Provas
  const prova1 = await prisma.prova.create({ data: { title: 'Avaliação de Tecnologia', description: 'Prova focada em desenvolvimento e lógica.', cursoId: 'c1', professorId: '2' } });
  const prova2 = await prisma.prova.create({ data: { title: 'Avaliação de Conhecimentos Gerais', description: 'Prova de matérias gerais.', cursoId: 'c2', professorId: '2' } });

  // --- PROVA COM 10 QUESTÕES ---

  // Q1 - Tech (Múltipla Escolha)
  await prisma.atividade.create({
    data: {
      title: 'Questão 1: O que é o React?',
      description: 'Responda qual é a definição correta do React no ecossistema de desenvolvimento frontend.',
      provaId: prova1.id, professorId: '2', type: 'MULTIPLA_ESCOLHA',
      configData: JSON.stringify({ options: ['Uma linguagem de programação', 'Uma biblioteca JavaScript para interfaces', 'Um banco de dados relacional', 'Um sistema operacional'], correct: 1 }),
      capacidades: { create: [{ capacidadeId: 'cap2' }] }, conhecimentos: { create: [{ conhecimentoId: 'con1' }] }
    }
  });

  // Q2 - Tech (Completar Código)
  await prisma.atividade.create({
    data: {
      title: 'Questão 2: Função Soma em JavaScript',
      description: 'Complete o código para criar uma função JS que recebe dois parâmetros "a" e "b" e retorna a soma deles.',
      provaId: prova1.id, professorId: '2', type: 'COMPLETAR_CODIGO',
      configData: JSON.stringify({ expected: 'function soma(a, b) {\n  return a + b;\n}' }),
      capacidades: { create: [{ capacidadeId: 'cap1' }] }, conhecimentos: { create: [{ conhecimentoId: 'con1' }] }
    }
  });

  // Q3 - Logic (Código Embaralhado)
  await prisma.atividade.create({
    data: {
      title: 'Questão 3: Ordenação de Laço (Loop)',
      description: 'Arraste as linhas para formar um laço `for` válido em JavaScript que conte até 5.',
      provaId: prova1.id, professorId: '2', type: 'CODIGO_EMBARALHADO',
      configData: JSON.stringify({ lines: ['for (let i = 0; i < 5; i++) {', '  console.log("Contador: " + i);', '}'] }),
      capacidades: { create: [{ capacidadeId: 'cap2' }] }, conhecimentos: { create: [{ conhecimentoId: 'con1' }] }
    }
  });

  // Q4 - Math (Múltipla Escolha)
  await prisma.atividade.create({
    data: {
      title: 'Questão 4: Equação de Primeiro Grau',
      description: 'Qual é o valor de X na equação: 2x + 5 = 15?',
      provaId: prova2.id, professorId: '2', type: 'MULTIPLA_ESCOLHA',
      configData: JSON.stringify({ options: ['X = 10', 'X = 2.5', 'X = 5', 'X = -5'], correct: 2 }),
      capacidades: { create: [{ capacidadeId: 'cap1' }] }, conhecimentos: { create: [{ conhecimentoId: 'con2' }] }
    }
  });

  // Q5 - History (Múltipla Escolha)
  await prisma.atividade.create({
    data: {
      title: 'Questão 5: História do Brasil',
      description: 'Em que ano o Brasil foi oficialmente descoberto pelos portugueses?',
      provaId: prova2.id, professorId: '2', type: 'MULTIPLA_ESCOLHA',
      configData: JSON.stringify({ options: ['1492', '1500', '1822', '1889'], correct: 1 }),
      capacidades: { create: [{ capacidadeId: 'cap4' }] }, conhecimentos: { create: [{ conhecimentoId: 'con3' }] }
    }
  });

  // Q6 - English (Múltipla Escolha)
  await prisma.atividade.create({
    data: {
      title: 'Questão 6: Verbo To Be',
      description: 'Complete a frase corretamente em inglês: "She ___ reading a very interesting book right now."',
      provaId: prova2.id, professorId: '2', type: 'MULTIPLA_ESCOLHA',
      configData: JSON.stringify({ options: ['are', 'am', 'is', 'be'], correct: 2 }),
      capacidades: { create: [{ capacidadeId: 'cap3' }] }, conhecimentos: { create: [{ conhecimentoId: 'con5' }] }
    }
  });

  // Q7 - Science (Texto Livre)
  await prisma.atividade.create({
    data: {
      title: 'Questão 7: Fotossíntese',
      description: 'Explique com suas palavras o processo de fotossíntese nas plantas. (Essa atividade exige correção manual do professor)',
      provaId: prova2.id, professorId: '2', type: 'UPLOAD',
      configData: null,
      capacidades: { create: [{ capacidadeId: 'cap3' }] }, conhecimentos: { create: [{ conhecimentoId: 'con6' }] }
    }
  });

  // Q8 - Geography (Múltipla Escolha)
  await prisma.atividade.create({
    data: {
      title: 'Questão 8: Capitais do Mundo',
      description: 'Qual é a capital da Austrália?',
      provaId: prova2.id, professorId: '2', type: 'MULTIPLA_ESCOLHA',
      configData: JSON.stringify({ options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correct: 2 }),
      capacidades: { create: [{ capacidadeId: 'cap4' }] }, conhecimentos: { create: [{ conhecimentoId: 'con4' }] }
    }
  });

  // Q9 - Database (Código Embaralhado)
  await prisma.atividade.create({
    data: {
      title: 'Questão 9: Consulta SQL Básica',
      description: 'Arraste as linhas para montar uma query SQL que seleciona todos os usuários ativos ordenados por nome.',
      provaId: prova1.id, professorId: '2', type: 'CODIGO_EMBARALHADO',
      configData: JSON.stringify({ lines: ['SELECT *', 'FROM usuarios', 'WHERE status = "ativo"', 'ORDER BY nome ASC;'] }),
      capacidades: { create: [{ capacidadeId: 'cap2' }] }, conhecimentos: { create: [{ conhecimentoId: 'con1' }] }
    }
  });

  // Q10 - Logic (Completar Código)
  await prisma.atividade.create({
    data: {
      title: 'Questão 10: Estrutura Condicional',
      description: 'Escreva um bloco "if / else" em JS que verifica se "idade >= 18". Se sim, retorna "Maior", senão retorna "Menor".',
      provaId: prova1.id, professorId: '2', type: 'COMPLETAR_CODIGO',
      configData: JSON.stringify({ expected: 'if (idade >= 18) {\n  return "Maior";\n} else {\n  return "Menor";\n}' }),
      capacidades: { create: [{ capacidadeId: 'cap1' }] }, conhecimentos: { create: [{ conhecimentoId: 'con1' }] }
    }
  });

  res.json({ message: 'Seed complete' });
});


// --- IA Routes ---
const rateLimits = new Map();

app.post('/api/ia/gerar-atividade', async (req, res) => {
  try {
    const { tipo, assunto, nivelDificuldade, professorId } = req.body;
    
    const pid = professorId || 'anon';
    const now = Date.now();
    let limitInfo = rateLimits.get(pid);
    if (!limitInfo || now > limitInfo.resetTime) {
      limitInfo = { count: 0, resetTime: now + 3600000 };
    }
    if (limitInfo.count >= 200) {
      return res.status(429).json({ error: "Limite atingido." });
    }
    limitInfo.count++;
    rateLimits.set(pid, limitInfo);

    if (!assunto || assunto.length > 300) {
      return res.status(400).json({ error: "Assunto invalido." });
    }

    const openai = new OpenAI({
      apiKey: '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',
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });

    let formatInstructions = "";
    if (tipo === 'MULTIPLA_ESCOLHA') {
      formatInstructions = `"options" (array com 4 opcoes string), "correct" (numero 0 a 3)`;
    } else if (tipo === 'COMPLETAR_CODIGO' || tipo === 'CODIGO_EMBARALHADO' || tipo === 'SEQUENCIA_LOGICA') {
      formatInstructions = `"expectedCode" ou "expected" (string com o codigo, use \\n)`;
    } else if (tipo === 'PREDICT_OUTPUT') {
      formatInstructions = `"expectedOutput" (string com a saida exata)`;
    } else if (tipo === 'TERMINAL_SIMULADO') {
      formatInstructions = `"expectedCommand" (string, comando terminal ex git commit)`;
    } else if (tipo === 'COMPLETE_FRASE') {
      formatInstructions = `"acceptedAnswers" (array de strings)`;
    } else if (tipo === 'DIAGRAMA_ASSOCIACAO') {
      formatInstructions = `"pairs" (array de objetos com "left" e "right")`;
    } else if (tipo === 'DEBUG_CHALLENGE') {
      formatInstructions = `"corrections" (array com 1 objeto contendo "line" numerico e "text" string)`;
    } else {
      formatInstructions = `sem campos extras`;
    }

    const systemPrompt = `Você é um assistente educacional que gera atividades estritamente em formato JSON.
O JSON DEVE conter as chaves "title" (título curto) e "description" (enunciado formatado em markdown).
Adicionalmente, devido ao tipo ` + tipo + `, o JSON DEVE conter estas chaves: ` + formatInstructions + `.
NAO retorne nenhum texto fora do JSON. NAO utilize blocos markdown como \`\`\`json, retorne APENAS o objeto puro.`;

    const userPrompt = `Gere uma questao do tipo ` + tipo + ` sobre ` + assunto + ` com dificuldade ` + (nivelDificuldade || 'MEDIO') + `.`;

    const completion = await openai.chat.completions.create({
      model: "z-ai/glm-5.3",
      messages: [
        {"role":"system", "content": systemPrompt},
        {"role":"user", "content": userPrompt}
      ],
      temperature: 0.5,
      top_p: 1,
      max_tokens: 1024,
      stream: false,
    });
     
    let aiText = completion.choices[0]?.message?.content || "{}";
    
    aiText = aiText.trim();
    if (aiText.startsWith('```json')) aiText = aiText.replace(/^```json/, '');
    if (aiText.startsWith('```')) aiText = aiText.replace(/^```/, '');
    if (aiText.endsWith('```')) aiText = aiText.slice(0, -3);
    aiText = aiText.trim();

    try {
      const parsed = JSON.parse(aiText);
      return res.json(parsed);
    } catch (parseError) {
      console.error("Failed to parse JSON:", aiText);
      return res.status(500).json({ error: "O modelo nao retornou JSON valido." });
    }
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno IA." });
  }
});


const PORT = process.env.PORT || 3001;

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

  const user = await prisma.user.findUnique({ where: { id: String(userId) } });
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
  const userId = String(req.query.userId);
  if (!userId) return res.status(400).json({ error: 'userId obrigatório' });

  const user = await prisma.user.findUnique({ where: { id: String(userId) } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  try {
    if (user.role === 'admin') {
      const turmas = await prisma.turma.findMany({ include: { curso: true, professorResponsavel: true, alunos: { include: { aluno: true } } } });
      return res.json(turmas);
    } else if (user.role === 'professor') {
      const turmas = await prisma.turma.findMany({
        where: { professorResponsavelId: user.id },
        include: { curso: true, professorResponsavel: true, alunos: { include: { aluno: true } } }
      });
      return res.json(turmas);
    } else {
      return res.status(403).json({ error: 'Acesso negado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar turmas' });
  }
});


app.post('/api/turmas/:turmaId/alunos/vincular', async (req, res) => {
  const { turmaId } = req.params;
  const { alunoIds } = req.body;
  const userId = String(req.headers['userid']);

  if (!alunoIds || !Array.isArray(alunoIds)) return res.status(400).json({ error: 'alunoIds inválido' });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const turma = await prisma.turma.findUnique({ where: { id: turmaId } });

  if (!user || !turma) return res.status(404).json({ error: 'Não encontrado' });
  if (user.role === 'professor' && turma.professorResponsavelId !== user.id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const criados = [];
  for (const alunoId of alunoIds) {
    try {
      const link = await prisma.aluno_Turma.upsert({
        where: { turmaId_alunoId: { alunoId, turmaId } },
        update: {},
        create: { alunoId, turmaId }
      });
      criados.push(link);
    } catch (e) {
      // Ignorar duplicados ou falhas individuais
    }
  }

  res.json({ message: 'Alunos vinculados com sucesso', count: criados.length });
});

app.delete('/api/turmas/:id', async (req, res) => {
  const { id } = req.params;
  const userId = (String(req.headers['userid']) as string) as string;
  
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


/**
 * @route PUT /api/users/:id
 * @desc Atualiza os dados básicos de um usuário
 * @access Admin
 */
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, username, role, password, senhaTemporaria } = req.body;
  
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
    if (senhaTemporaria !== undefined) dataToUpdate.senhaTemporaria = senhaTemporaria;

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuário.' });
  }
});

app.patch('/api/users/:id/permissao-turma', async (req, res) => {
  const { id } = req.params;
  const userId = (String(req.headers['userid']) as string) as string;
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

  const user = await prisma.user.findUnique({ where: { id: String(userId) } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  
  if (user.password !== senhaAtual) {
    return res.status(401).json({ error: 'Senha atual incorreta' });
  }

  await prisma.user.update({
    where: { id: String(userId) },
    data: { password: novaSenha, senhaTemporaria: false }
  });

  res.json({ success: true });
});


app.post('/api/turmas/:turmaId/alunos/manual', async (req, res) => {
  const turmaId = req.params.turmaId;
  const { nome, username, senha } = req.body;
  const userId = String(req.headers['userid']);

  if (!nome || !username) return res.status(400).json({ error: 'Nome e username/email são obrigatórios.' });

  const userAdminOrProf = await prisma.user.findUnique({ where: { id: userId } });
  const turma = await prisma.turma.findUnique({ where: { id: turmaId } });

  if (!userAdminOrProf || !turma) return res.status(404).json({ error: 'Usuário logado ou Turma não encontrados' });
  if (userAdminOrProf.role === 'professor' && turma.professorResponsavelId !== userAdminOrProf.id) {
    return res.status(403).json({ error: 'Acesso negado: Você não é o professor responsável por esta turma' });
  }

  let alunoId = '';
  // Check if student exists
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    if (existingUser.role !== 'aluno') return res.status(400).json({ error: 'Usuário já existe e não é aluno.' });
    alunoId = existingUser.id;
  } else {
    // Create new student
    const defaultPassword = senha || 'mudar123';
    const newAluno = await prisma.user.create({
      data: {
        name: nome,
        username,
        password: defaultPassword,
        role: 'aluno',
        senhaTemporaria: true
      }
    });
    alunoId = newAluno.id;
  }

  // Link student to class
  const existingLink = await prisma.aluno_Turma.findUnique({
    where: { turmaId_alunoId: { alunoId, turmaId } }
  });

  if (existingLink) {
    return res.status(200).json({ message: 'Aluno já estava na turma.', alunoId });
  }

  await prisma.aluno_Turma.create({
    data: { alunoId, turmaId }
  });

  res.status(200).json({ message: 'Aluno adicionado com sucesso.', alunoId });
});

app.post('/api/turmas/:turmaId/alunos/upload', upload.single('file'), async (req, res) => {
  const turmaId = String(req.params.turmaId);
  const userId = (String(req.headers['userid']) as string) as string;

  if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado' });

  const user = await prisma.user.findUnique({ where: { id: String(userId) } });
  const turma = await prisma.turma.findUnique({ where: { id: turmaId } });

  if (!user || !turma) return res.status(404).json({ error: 'Usuário ou Turma não encontrados' });

  if (user.role === 'professor' && turma.professorResponsavelId !== user.id) {
    return res.status(403).json({ error: 'Acesso negado: Você não é o professor responsável por esta turma' });
  }

  let data: any[] = [];
  try {
    if (req.file.originalname.endsWith('.csv')) {
      const csvStr = req.file.buffer.toString('utf8');
      const result = Papa.parse(csvStr, { header: true, skipEmptyLines: true });
      data = result.data as any[];
    } else if (req.file.originalname.endsWith('.xlsx')) {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      data = xlsx.utils.sheet_to_json(sheet) as any[];
    } else {
      return res.status(400).json({ error: 'Formato inválido. Use .csv ou .xlsx' });
    }
  } catch(e) {
    return res.status(400).json({ error: 'Erro ao ler arquivo: ' + (e as any).message });
  }

  const relatorio: { criados: number, jaExistiam: number, rejeitados: any[], alertas: any[] } = { criados: 0, jaExistiam: 0, rejeitados: [], alertas: [] };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (let i = 0; i < data.length; i++) {
    const row = data[i] as any;
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
      relatorio.rejeitados.push({ linha: linhaNum, motivo: 'Erro no banco: ' + (e as any).message });
    }
  }

  res.json(relatorio);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
