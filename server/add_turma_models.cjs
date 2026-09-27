const fs = require('fs');
let c = fs.readFileSync('prisma/schema.prisma', 'utf8');

c += `
model Turma {
  id                    String   @id @default(uuid())
  nome                  String
  cursoId               String
  curso                 Curso    @relation(fields: [cursoId], references: [id])
  professorResponsavelId String
  professorResponsavel  User     @relation("TurmaProfessor", fields: [professorResponsavelId], references: [id])
  criadoPor             String   // 'ADMIN' | 'PROFESSOR'
  alunos                Aluno_Turma[]
  provas                Prova_Turma[]
  createdAt             DateTime @default(now())
}

model Aluno_Turma {
  id       String @id @default(uuid())
  turmaId  String
  turma    Turma  @relation(fields: [turmaId], references: [id], onDelete: Cascade)
  alunoId  String
  aluno    User   @relation(fields: [alunoId], references: [id], onDelete: Cascade)
  @@unique([turmaId, alunoId])
}

model Prova_Turma {
  id      String @id @default(uuid())
  provaId String
  prova   Prova  @relation(fields: [provaId], references: [id], onDelete: Cascade)
  turmaId String
  turma   Turma  @relation(fields: [turmaId], references: [id], onDelete: Cascade)
  @@unique([provaId, turmaId])
}
`;

// Add new fields to User
c = c.replace(
  `  progressosProva  ProgressoProva[]\n}`,
  `  progressosProva  ProgressoProva[]\n  senhaTemporaria  Boolean @default(false)\n  matricula        String?\n  turmasMinistradas Turma[] @relation("TurmaProfessor")\n  turmasMatriculadas Aluno_Turma[]\n}`
);

fs.writeFileSync('prisma/schema.prisma', c);
console.log('Appended Turma models and updated User');
