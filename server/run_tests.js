const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:3001/api';
let results = [];

function log(test, status) {
  results.push(`[${status}] ${test}`);
  console.log(`[${status}] ${test}`);
}

async function runTests() {
  try {
    // 1. Create a Professor 1 and Professor 2 for isolation test
    let prof1 = await axios.post(`${BASE_URL}/register`, { name: 'Prof A', username: 'profa', password: '123', role: 'professor' }).catch(e => e.response);
    let prof2 = await axios.post(`${BASE_URL}/register`, { name: 'Prof B', username: 'profb', password: '123', role: 'professor' }).catch(e => e.response);

    // Get the seeded Admin and Course
    const turmasAdmin = await axios.get(`${BASE_URL}/turmas?userId=1`); // Admin is 1
    
    // Give Prof A permission to create turmas
    await axios.patch(`${BASE_URL}/users/${prof1.data.id}/permissao-turma`, { podeCriarTurma: true }, { headers: { userid: '1' } });

    // 2. Create Turma as Prof A (Try to forge prof id)
    let res = await axios.post(`${BASE_URL}/turmas`, { nome: 'Turma Teste', cursoId: 'c1', professorResponsavelId: prof2.data.id, userId: prof1.data.id }).catch(e => e.response);
    if (res.data.professorResponsavelId === prof1.data.id) {
      log("Criação de Turma (Forçar ID próprio)", "PASSOU");
    } else {
      log("Criação de Turma (Forçar ID próprio)", "FALHOU");
    }
    const turmaId = res.data.id;

    // 3. Isolation between professors
    res = await axios.delete(`${BASE_URL}/turmas/${turmaId}`, { headers: { userid: prof2.data.id } }).catch(e => e.response);
    if (res.status === 403) {
      log("Isolamento entre Professores (Delete 403)", "PASSOU");
    } else {
      log("Isolamento entre Professores (Delete 403)", "FALHOU");
    }

    // 4. Upload de arquivo válido + misturado + duplicado
    // Let's create a CSV
    const csvContent = `id,nome,email
101,João Válido,joaov@teste.com
102,,semnome@teste.com
103,Maria Inválida,maria_teste
104,João Válido,joaov@teste.com
105,José Duplicado,joao@teste.com
`;
    fs.writeFileSync('test.csv', csvContent);

    const form = new FormData();
    form.append('file', fs.createReadStream('test.csv'));

    res = await axios.post(`${BASE_URL}/turmas/${turmaId}/alunos/upload`, form, { headers: { ...form.getHeaders(), userid: prof1.data.id } }).catch(e => e.response);
    
    if (res.data.criados === 1 && res.data.rejeitados.length === 2 && res.data.jaExistiam === 1) { // Wait, joao@teste.com might exist if seeded.
      log("Upload de arquivo (Criados, Rejeitados, Já Existentes)", "PASSOU");
    } else {
      log("Upload de arquivo (Lógica mista)", "FALHOU");
      console.log(res.data);
    }

    // 5. File size limit
    const bigBuffer = Buffer.alloc(3 * 1024 * 1024, 'a');
    fs.writeFileSync('big.csv', bigBuffer);
    const form2 = new FormData();
    form2.append('file', fs.createReadStream('big.csv'), { filename: 'big.csv' });
    res = await axios.post(`${BASE_URL}/turmas/${turmaId}/alunos/upload`, form2, { headers: { ...form2.getHeaders(), userid: prof1.data.id } }).catch(e => e.response);
    if (res.status === 413 || res.data.error || (res.status === 400 && res.data.error)) {
      log("Limite de tamanho de arquivo (> 2MB)", "PASSOU");
    } else {
      log("Limite de tamanho de arquivo (> 2MB)", "FALHOU");
    }

    // 6. Temporary password flow
    // The created user is joaov@teste.com. 
    let login = await axios.post(`${BASE_URL}/login`, { username: 'joaov@teste.com', password: '123' }).catch(e => e.response);
    // Wait, the upload route creates with password "123456" as per spec (even if plain text in mock). Let's use 123456
    login = await axios.post(`${BASE_URL}/login`, { username: 'joaov@teste.com', password: '123456' }).catch(e => e.response);
    if (login.data.senhaTemporaria === true) {
      log("Login de importado (senhaTemporaria: true)", "PASSOU");
      // Change password
      res = await axios.post(`${BASE_URL}/usuarios/trocar-senha`, { userId: login.data.id, senhaAtual: '123456', novaSenha: 'newpassword123' }).catch(e => e.response);
      if (res.data.success) {
        log("Troca de senha obrigatória", "PASSOU");
      } else {
        log("Troca de senha obrigatória", "FALHOU");
      }
    } else {
      log("Login de importado (senhaTemporaria: true)", "FALHOU");
    }

    fs.writeFileSync('test_report.txt', results.join('\\n'));
    console.log("All backend tests ran.");
  } catch (e) {
    console.error(e);
  }
}
runTests();
