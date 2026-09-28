export type Role = 'admin' | 'professor' | 'aluno';

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  podeCriarTurma?: boolean;
  senhaTemporaria?: boolean;
  matricula?: string;
}

export interface Turma {
  id: string;
  name: string;
  professorId: string;
  codigo: string;
}

export interface Curso {
  id: string;
  name: string;
  categoriaId?: string;
}

export type CapacidadeTipo = 'Básica' | 'Técnica' | 'Socioemocional';

export interface Capacidade {
  id: string;
  name: string;
  type: CapacidadeTipo;
}

export interface Conhecimento {
  id: string;
  name: string;
}

export interface Prova {
  id: string;
  title: string;
  description: string;
  cursoId: string;
  professorId: string;
  turmaIds?: string[];
  ativa?: boolean;
  pin?: string;
}

export interface ProgressoProva {
  id: string;
  alunoId: string;
  provaId: string;
  currentIndex: number;
  streak: number;
  xpAccumulated: number;
  vidasRestantes: number;
  isFinished: boolean;
}

export interface Atividade {
  id: string;
  title: string;
  description: string;
  professorId: string;
  provaId: string;
  capacidadeIds: string[];
  conhecimentoIds: string[];
  fileUrl?: string; // Mock upload
  type: string; // 'UPLOAD', 'MULTIPLA_ESCOLHA', 'COMPLETAR_CODIGO'
  configData?: string; // We'll parse it as needed
  createdAt: string;
}

export interface Submissao {
  id: string;
  atividadeId: string;
  alunoId: string;
  answerText?: string;
  fileUrl?: string;
  score?: number;
  feedback?: string;
  submittedAt: string;
}
