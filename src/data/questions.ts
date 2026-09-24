export type QuestionDifficulty = 'BÁSICO' | 'INTERMEDIÁRIO' | 'AVANÇADO' | 'BOSS';
export type QuestionCategory = 'FUNDAMENTOS' | 'CONCEITUAL' | 'LÓGICO' | 'TIPOS' | 'SQL' | 'INTEGRAÇÃO' | 'MODELO LÓGICO';

export type QuestionType =
  | 'multiple_choice'
  | 'drag_drop_relationship'
  | 'drag_drop_blocks'
  | 'sql_input'
  | 'sql_complete'
  | 'error_hunt'
  | 'diagram_complete';

export interface BaseQuestion {
  id: number;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  category: QuestionCategory;
  xp: number;
  title?: string;
  text: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: string[];
  correctOption: number;
}

export interface SqlInputQuestion extends BaseQuestion {
  type: 'sql_input';
  expectedQuery: string[]; // List of acceptable variations, though we might parse semantics
  initialCode?: string;
}

export interface DragDropRelationshipQuestion extends BaseQuestion {
  type: 'drag_drop_relationship';
  pieces: string[];
  correctSequence: string[];
  slotsCount: number;
}

export interface DragDropBlocksQuestion extends BaseQuestion {
  type: 'drag_drop_blocks';
  blocks: string[];
  correctSequence: string[];
}

export interface SqlCompleteQuestion extends BaseQuestion {
  type: 'sql_complete';
  codeBefore: string;
  codeAfter: string;
  expectedWord: string;
}

export interface ErrorHuntQuestion extends BaseQuestion {
  type: 'error_hunt';
  code: string;
  options: string[];
  correctOption: number;
}

export interface DiagramCompleteQuestion extends BaseQuestion {
  type: 'diagram_complete';
  diagramCode: string; // ASCII or Mermaid
  expectedAnswer: string;
}

export type Question =
  | MultipleChoiceQuestion
  | SqlInputQuestion
  | DragDropRelationshipQuestion
  | DragDropBlocksQuestion
  | SqlCompleteQuestion
  | ErrorHuntQuestion
  | DiagramCompleteQuestion;

export const questions: Question[] = [
  // QUESTÃO 01
  {
    id: 1,
    type: 'multiple_choice',
    difficulty: 'BÁSICO',
    category: 'FUNDAMENTOS',
    xp: 100,
    text: 'Qual alternativa descreve melhor um SGBD?',
    options: [
      'Uma tabela do banco',
      'Um software que gerencia bancos de dados',
      'Uma coluna identificadora',
      'Um diagrama conceitual'
    ],
    correctOption: 1
  },
  // QUESTÃO 02
  {
    id: 2,
    type: 'multiple_choice',
    difficulty: 'BÁSICO',
    category: 'FUNDAMENTOS',
    xp: 100,
    text: 'Qual linguagem utilizamos para trabalhar com bancos de dados relacionais nesta aula?',
    options: ['HTML', 'SQL', 'CSS', 'PNG'],
    correctOption: 1
  },
  // QUESTÃO 03
  {
    id: 3,
    type: 'multiple_choice',
    difficulty: 'BÁSICO',
    category: 'FUNDAMENTOS',
    xp: 100,
    text: 'O que melhor define um banco de dados?',
    options: [
      'Conjunto organizado de dados relacionados',
      'Apenas um arquivo de imagem',
      'Programa usado somente para desenhar DER',
      'Uma única coluna'
    ],
    correctOption: 0
  },
  // QUESTÃO 04
  {
    id: 4,
    type: 'multiple_choice',
    difficulty: 'BÁSICO',
    category: 'CONCEITUAL',
    xp: 100,
    text: 'No modelo conceitual, ALUNO normalmente será:',
    options: [
      'Entidade',
      'Chave estrangeira',
      'Tipo de dado',
      'Comando SQL'
    ],
    correctOption: 0
  },
  // QUESTÃO 05
  {
    id: 5,
    type: 'multiple_choice',
    difficulty: 'BÁSICO',
    category: 'CONCEITUAL',
    xp: 100,
    text: 'O que um atributo representa?',
    options: [
      'Uma característica de uma entidade',
      'Um SGBD',
      'Um comando SQL',
      'Uma tabela associativa obrigatória'
    ],
    correctOption: 0
  },
  // QUESTÃO 06
  {
    id: 6,
    type: 'multiple_choice',
    difficulty: 'INTERMEDIÁRIO',
    category: 'CONCEITUAL',
    xp: 150,
    text: 'CURSO 1 ─── POSSUI ─── ? ALUNO\n\nSe um curso possui vários alunos, qual cardinalidade deve substituir "?"?',
    options: ['0', '1', 'N', 'PK'],
    correctOption: 2
  },
  // QUESTÃO 07
  {
    id: 7,
    type: 'multiple_choice',
    difficulty: 'INTERMEDIÁRIO',
    category: 'CONCEITUAL',
    xp: 150,
    text: 'ALUNO N ─── ? ─── 1 CURSO\n\nQual elemento deve ocupar o losango?',
    options: ['MATRICULA-SE', 'PRIMARY KEY', 'VARCHAR', 'DATABASE'],
    correctOption: 0
  },
  // QUESTÃO 08
  {
    id: 8,
    type: 'drag_drop_relationship',
    difficulty: 'INTERMEDIÁRIO',
    category: 'CONCEITUAL',
    xp: 200,
    text: 'Regra: "Um PROFESSOR ministra várias DISCIPLINAS."\nMonte o relacionamento:',
    pieces: ['PROFESSOR', 'MINISTRA', 'DISCIPLINA', '1', 'N', 'ALUNO', 'CURSA'],
    correctSequence: ['PROFESSOR', '1', 'MINISTRA', 'N', 'DISCIPLINA'],
    slotsCount: 5
  },
  // QUESTÃO 09
  {
    id: 9,
    type: 'multiple_choice',
    difficulty: 'INTERMEDIÁRIO',
    category: 'CONCEITUAL',
    xp: 150,
    text: 'O que significa cardinalidade 1:1?',
    options: [
      'Uma ocorrência relaciona-se com no máximo uma ocorrência do outro lado',
      'Várias ocorrências para várias',
      'Uma tabela deve ter uma FK',
      'Não existe relacionamento'
    ],
    correctOption: 0
  },
  // QUESTÃO 10
  {
    id: 10,
    type: 'multiple_choice',
    difficulty: 'AVANÇADO',
    category: 'CONCEITUAL',
    xp: 200,
    text: 'LIVRO N ─── ESCREVE ─── N AUTOR\n\nQual tipo de relacionamento aparece?',
    options: ['1:1', '1:N', 'N:N', '0:0'],
    correctOption: 2
  },
  // CHECKPOINT 1 APÓS A 10
  // QUESTÃO 11
  {
    id: 11,
    type: 'multiple_choice',
    difficulty: 'BÁSICO',
    category: 'LÓGICO',
    xp: 100,
    text: 'Qual é a função da PK?',
    options: [
      'Identificar unicamente o registro',
      'Guardar somente textos',
      'Criar o banco',
      'Excluir tabelas'
    ],
    correctOption: 0
  },
  // QUESTÃO 12
  {
    id: 12,
    type: 'multiple_choice',
    difficulty: 'BÁSICO',
    category: 'LÓGICO',
    xp: 100,
    text: 'Qual é a função de uma FK?',
    options: [
      'Relacionar registros/tabelas',
      'Criar imagens',
      'Substituir todos os atributos',
      'Criar um SGBD'
    ],
    correctOption: 0
  },
  // QUESTÃO 13
  {
    id: 13,
    type: 'multiple_choice',
    difficulty: 'INTERMEDIÁRIO',
    category: 'LÓGICO',
    xp: 160,
    text: 'ALUNO\n----------------\nid_aluno PK\nnome\ncpf\n??? FK\n\nCURSO\n----------------\nid_curso PK\nnome\n\nQual campo substitui "???"?',
    options: ['id_curso', 'nome_curso', 'CREATE', 'id_aluno'],
    correctOption: 0
  },
  // QUESTÃO 14
  {
    id: 14,
    type: 'multiple_choice',
    difficulty: 'INTERMEDIÁRIO',
    category: 'LÓGICO',
    xp: 150,
    text: 'CURSO 1:N ALUNO.\nOnde normalmente ficará id_curso como FK?',
    options: ['CURSO', 'ALUNO', 'Nas duas obrigatoriamente', 'Em nenhuma'],
    correctOption: 1
  },
  // QUESTÃO 15
  {
    id: 15,
    type: 'multiple_choice',
    difficulty: 'AVANÇADO',
    category: 'LÓGICO',
    xp: 200,
    text: 'LIVRO N:N AUTOR.\nO que deve ser criado no modelo lógico?',
    options: [
      'LIVRO_AUTOR',
      'Excluir AUTOR',
      'Duplicar LIVRO',
      'Transformar autor em VARCHAR'
    ],
    correctOption: 0
  },
  // QUESTÃO 16
  {
    id: 16,
    type: 'drag_drop_relationship',
    difficulty: 'AVANÇADO',
    category: 'LÓGICO',
    xp: 280,
    text: 'Criar tabela associativa para: ALUNO N:N DISCIPLINA\nMonte as colunas: Nome da tabela, FK 1, FK 2.',
    pieces: ['MATRICULA', 'id_aluno', 'id_disciplina', 'nome', 'cpf', 'CURSO'],
    correctSequence: ['MATRICULA', 'id_aluno', 'id_disciplina'],
    slotsCount: 3
  },
  // QUESTÃO 17
  {
    id: 17,
    type: 'multiple_choice',
    difficulty: 'INTERMEDIÁRIO',
    category: 'LÓGICO',
    xp: 180,
    text: 'Qual frase está correta?',
    options: [
      'PK identifica e FK conecta',
      'FK sempre substitui a PK',
      'PK serve apenas para textos',
      'PK e FK são tipos de dados'
    ],
    correctOption: 0
  },
  // QUESTÃO 18
  {
    id: 18,
    type: 'multiple_choice',
    difficulty: 'INTERMEDIÁRIO',
    category: 'LÓGICO',
    xp: 150,
    text: 'No brModelo, qual elemento representa uma estrutura que armazenará registros?',
    options: ['Table', 'Nota', 'View obrigatoriamente', 'Texto livre'],
    correctOption: 0
  },
  // QUESTÃO 19
  {
    id: 19,
    type: 'multiple_choice',
    difficulty: 'INTERMEDIÁRIO',
    category: 'LÓGICO',
    xp: 150,
    text: 'Para que serve uma Nota no brModelo?',
    options: [
      'Documentar observações no diagrama',
      'Armazenar registros',
      'Substituir uma PK',
      'Executar SQL'
    ],
    correctOption: 0
  },
  // QUESTÃO 20
  {
    id: 20,
    type: 'multiple_choice',
    difficulty: 'INTERMEDIÁRIO',
    category: 'LÓGICO',
    xp: 180,
    text: 'Uma View pode ser entendida como:',
    options: [
      'Uma visão virtual de dados obtidos por consulta',
      'Uma chave primária',
      'Um tipo de atributo',
      'Um relacionamento conceitual'
    ],
    correctOption: 0
  },
  // CHECKPOINT 2 APÓS A 20
  // QUESTÃO 21
  {
    id: 21,
    type: 'multiple_choice',
    difficulty: 'BÁSICO',
    category: 'TIPOS',
    xp: 100,
    text: 'Tipo adequado para nome:',
    options: ['DATE', 'BOOLEAN', 'VARCHAR', 'DECIMAL'],
    correctOption: 2
  },
  // QUESTÃO 22
  {
    id: 22,
    type: 'multiple_choice',
    difficulty: 'BÁSICO',
    category: 'TIPOS',
    xp: 100,
    text: 'Tipo adequado para data de nascimento:',
    options: ['DATE', 'INT', 'BOOLEAN', 'DECIMAL'],
    correctOption: 0
  },
  // QUESTÃO 23
  {
    id: 23,
    type: 'multiple_choice',
    difficulty: 'INTERMEDIÁRIO',
    category: 'TIPOS',
    xp: 120,
    text: 'Tipo adequado para preço:',
    options: ['DATE', 'DECIMAL', 'BOOLEAN', 'VARCHAR exclusivamente'],
    correctOption: 1
  },
  // QUESTÃO 24
  {
    id: 24,
    type: 'multiple_choice',
    difficulty: 'INTERMEDIÁRIO',
    category: 'TIPOS',
    xp: 120,
    text: 'Tipo apropriado para uma quantidade inteira:',
    options: ['INT', 'DATE', 'VARCHAR obrigatoriamente', 'BOOLEAN'],
    correctOption: 0
  },
  // QUESTÃO 25
  {
    id: 25,
    type: 'multiple_choice',
    difficulty: 'INTERMEDIÁRIO',
    category: 'SQL',
    xp: 150,
    text: 'Qual comando cria o banco escola?',
    options: [
      'MAKE escola;',
      'CREATE DATABASE escola;',
      'USE DATABASE escola;',
      'CREATE TABLE escola;'
    ],
    correctOption: 1
  },
  // QUESTÃO 26
  {
    id: 26,
    type: 'sql_input',
    difficulty: 'INTERMEDIÁRIO',
    category: 'SQL',
    xp: 180,
    text: 'Escreva o comando para selecionar o banco escola.',
    expectedQuery: ['USE escola;', 'USE escola']
  },
  // QUESTÃO 27
  {
    id: 27,
    type: 'sql_complete',
    difficulty: 'INTERMEDIÁRIO',
    category: 'SQL',
    xp: 200,
    text: 'Preencha.',
    codeBefore: 'CREATE TABLE aluno (\n    id_aluno INT ',
    codeAfter: ',\n    nome VARCHAR(100)\n);',
    expectedWord: 'PRIMARY KEY'
  },
  // QUESTÃO 28
  {
    id: 28,
    type: 'sql_complete',
    difficulty: 'INTERMEDIÁRIO',
    category: 'SQL',
    xp: 180,
    text: 'Preencha.',
    codeBefore: 'CREATE TABLE aluno (\n    id_aluno INT PRIMARY KEY,\n    nome ',
    codeAfter: ' NOT NULL\n);',
    expectedWord: 'VARCHAR(100)'
  },
  // QUESTÃO 29
  {
    id: 29,
    type: 'sql_complete',
    difficulty: 'INTERMEDIÁRIO',
    category: 'SQL',
    xp: 180,
    text: 'Preencha.',
    codeBefore: 'cpf VARCHAR(14) ',
    codeAfter: '',
    expectedWord: 'UNIQUE'
  },
  // QUESTÃO 30
  {
    id: 30,
    type: 'sql_complete',
    difficulty: 'AVANÇADO',
    category: 'SQL',
    xp: 220,
    text: 'Preencha.',
    codeBefore: 'FOREIGN KEY (id_curso)\n',
    codeAfter: ' curso(id_curso)',
    expectedWord: 'REFERENCES'
  },
  // CHECKPOINT 3 APÓS A 30
  // QUESTÃO 31
  {
    id: 31,
    type: 'sql_input',
    difficulty: 'AVANÇADO',
    category: 'SQL',
    xp: 220,
    text: 'Escreva o comando completo para criar o banco: biblioteca',
    expectedQuery: ['CREATE DATABASE biblioteca;', 'CREATE DATABASE biblioteca']
  },
  // QUESTÃO 32
  {
    id: 32,
    type: 'error_hunt',
    difficulty: 'AVANÇADO',
    category: 'SQL',
    xp: 260,
    text: 'Qual é o principal problema no código abaixo?',
    code: 'CREATE TABLE aluno (\n    id_aluno DATE PRIMARY KEY,\n    nome VARCHAR(100),\n    data_nascimento INT\n);',
    options: [
      'id_aluno deveria utilizar um tipo apropriado ao identificador (como INT) e data_nascimento utilizar DATE.',
      'PRIMARY KEY não existe.',
      'nome deve ser DATE.',
      'CREATE TABLE serve para SELECT.'
    ],
    correctOption: 0
  },
  // QUESTÃO 33
  {
    id: 33,
    type: 'error_hunt',
    difficulty: 'AVANÇADO',
    category: 'SQL',
    xp: 260,
    text: 'Por que está incorreto considerando que id_curso representa um curso?',
    code: 'FOREIGN KEY (id_curso)\nREFERENCES professor(id_professor)',
    options: [
      'A FK referencia uma entidade/coluna incompatível',
      'REFERENCES não existe',
      'FK deve apontar para ela mesma',
      'FK só funciona com VARCHAR'
    ],
    correctOption: 0
  },
  // QUESTÃO 34
  {
    id: 34,
    type: 'drag_drop_blocks',
    difficulty: 'AVANÇADO',
    category: 'SQL',
    xp: 300,
    text: 'Ordene os blocos para criar o banco e a tabela corretamente.',
    blocks: [
      'CREATE TABLE curso (\n    id_curso INT PRIMARY KEY\n);',
      'USE escola;',
      'CREATE DATABASE escola;'
    ],
    correctSequence: [
      'CREATE DATABASE escola;',
      'USE escola;',
      'CREATE TABLE curso (\n    id_curso INT PRIMARY KEY\n);'
    ]
  },
  // QUESTÃO 35
  {
    id: 35,
    type: 'drag_drop_blocks',
    difficulty: 'AVANÇADO',
    category: 'SQL',
    xp: 280,
    text: 'Monte o comando para o atributo cpf.',
    blocks: ['UNIQUE', 'cpf', 'VARCHAR(14)'],
    correctSequence: ['cpf', 'VARCHAR(14)', 'UNIQUE']
  },
  // QUESTÃO 36
  {
    id: 36,
    type: 'multiple_choice',
    difficulty: 'INTERMEDIÁRIO',
    category: 'INTEGRAÇÃO',
    xp: 150,
    text: 'ENTIDADE CURSO -> ? -> MODELO LÓGICO\n\nO que CURSO se torna?',
    options: ['Tabela CURSO', 'SELECT', 'DATE', 'atributo nome'],
    correctOption: 0
  },
  // QUESTÃO 37
  {
    id: 37,
    type: 'multiple_choice',
    difficulty: 'INTERMEDIÁRIO',
    category: 'INTEGRAÇÃO',
    xp: 150,
    text: 'Qual sequência representa o caminho estudado?',
    options: [
      'SQL → mundo real → entidade',
      'Mundo real → modelo conceitual → modelo lógico → SQL → banco de dados',
      'tabela → internet',
      'banco → apagar → DER'
    ],
    correctOption: 1
  },
  // QUESTÃO 38
  {
    id: 38,
    type: 'diagram_complete',
    difficulty: 'AVANÇADO',
    category: 'LÓGICO',
    xp: 300,
    text: 'CURSO (1) --- (N) ALUNO\n\nCURSO\n----------------\nid_curso PK\nnome\n\nALUNO\n----------------\nid_aluno PK\nnome\n???\n\nComplete o atributo ausente no ALUNO.',
    diagramCode: 'ALUNO',
    expectedAnswer: 'id_curso FK' // This could just be a sql_complete style actually
  },
  // QUESTÃO 39
  {
    id: 39,
    type: 'drag_drop_relationship',
    difficulty: 'BOSS',
    category: 'MODELO LÓGICO',
    xp: 400,
    text: 'BOSS DATABASE - Monte a tabela associativa EMPRESTIMO corretamente com sua PK e as duas FKs.',
    pieces: ['EMPRESTIMO', 'AUTOR', 'id_emprestimo', 'id_aluno', 'id_livro', 'id_autor', 'data_emprestimo', 'data_devolucao', 'nome', 'isbn'],
    correctSequence: ['EMPRESTIMO', 'id_emprestimo', 'id_aluno', 'id_livro', 'data_emprestimo', 'data_devolucao'],
    slotsCount: 6
  },
  // QUESTÃO 40
  {
    id: 40,
    type: 'sql_input',
    difficulty: 'BOSS',
    category: 'SQL',
    xp: 500,
    text: 'BOSS FINAL: Escreva o comando de criação da tabela curso.\n\nid_curso INT PK\nnome VARCHAR(100) NOT NULL',
    expectedQuery: [
      'create table curso ( id_curso int primary key , nome varchar ( 100 ) not null )',
      'CREATE TABLE curso ( id_curso INT PRIMARY KEY, nome VARCHAR(100) NOT NULL );'
    ]
  }
];
