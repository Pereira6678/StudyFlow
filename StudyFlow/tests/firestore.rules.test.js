const { after, before, beforeEach, test } = require('node:test');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} = require('@firebase/rules-unit-testing');
const {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} = require('firebase/firestore');

const projectId = 'demo-studyflow-rules';
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080';
const [host, port] = emulatorHost.split(':');
const rules = readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8');

const materiaValida = {
  id: 'materia-1',
  nome: 'Desenvolvimento Mobile',
  professor: 'Kellen Nery',
  cor: '#3B82F6',
};

const tarefaValida = {
  id: 'tarefa-1',
  titulo: 'Finalizar atividade',
  materia: 'Desenvolvimento Mobile',
  descricao: 'Atividade prática',
  prazo: '05/09/2026',
  status: 'pendente',
  prioridade: 'Alta',
};

const provaValida = {
  id: 'prova-1',
  materia: 'Desenvolvimento Mobile',
  nome: 'Prova 1',
  data: '15/09/2026',
};

let testEnvironment;

function userDb(uid) {
  return testEnvironment.authenticatedContext(uid).firestore();
}

function unauthenticatedDb() {
  return testEnvironment.unauthenticatedContext().firestore();
}

function recordRef(db, uid, collectionName, documentId) {
  return doc(db, 'usuarios', uid, collectionName, documentId);
}

async function seedDocument(uid, collectionName, documentId, data) {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      recordRef(context.firestore(), uid, collectionName, documentId),
      data,
    );
  });
}

before(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: {
      host,
      port: Number(port),
      rules,
    },
  });
});

beforeEach(async () => {
  await testEnvironment.clearFirestore();
});

after(async () => {
  await testEnvironment?.cleanup();
});

test('usuário autenticado consulta seus próprios documentos', async () => {
  await seedDocument('usuario-a', 'materias', 'materia-1', materiaValida);
  const db = userDb('usuario-a');

  await assertSucceeds(getDoc(recordRef(db, 'usuario-a', 'materias', 'materia-1')));
  await assertSucceeds(getDocs(collection(db, 'usuarios', 'usuario-a', 'materias')));
});

test('usuário autenticado cria documentos válidos no próprio caminho', async () => {
  const db = userDb('usuario-a');

  await assertSucceeds(
    setDoc(recordRef(db, 'usuario-a', 'materias', 'materia-1'), materiaValida),
  );
});

test('usuário A não consulta documentos do usuário B', async () => {
  await seedDocument('usuario-b', 'materias', 'materia-b', materiaValida);
  const db = userDb('usuario-a');

  await assertFails(
    getDoc(recordRef(db, 'usuario-b', 'materias', 'materia-b')),
  );
  await assertFails(
    getDocs(collection(db, 'usuarios', 'usuario-b', 'materias')),
  );
});

test('usuário A não cria documentos no caminho do usuário B', async () => {
  const db = userDb('usuario-a');

  await assertFails(
    setDoc(recordRef(db, 'usuario-b', 'materias', 'materia-b'), materiaValida),
  );
});

test('usuário A não atualiza nem exclui documentos do usuário B', async () => {
  await seedDocument('usuario-b', 'materias', 'materia-b', materiaValida);
  const db = userDb('usuario-a');
  const ref = recordRef(db, 'usuario-b', 'materias', 'materia-b');

  await assertFails(updateDoc(ref, { nome: 'Nome alterado' }));
  await assertFails(deleteDoc(ref));
});

test('usuário não autenticado não lê nem grava documentos', async () => {
  await seedDocument('usuario-a', 'materias', 'materia-1', materiaValida);
  const db = unauthenticatedDb();
  const ref = recordRef(db, 'usuario-a', 'materias', 'materia-1');

  await assertFails(getDoc(ref));
  await assertFails(setDoc(recordRef(db, 'usuario-a', 'materias', 'materia-2'), materiaValida));
  await assertFails(updateDoc(ref, { nome: 'Nome alterado' }));
  await assertFails(deleteDoc(ref));
});

test('caminhos fora das coleções previstas permanecem negados', async () => {
  const db = userDb('usuario-a');
  const ref = doc(db, 'usuarios', 'usuario-a', 'configuracoes', 'privadas');

  await assertFails(getDoc(ref));
  await assertFails(setDoc(ref, { habilitado: true }));
});

test('matérias permitem criação, consulta, atualização e exclusão válidas', async () => {
  const db = userDb('usuario-a');
  const ref = recordRef(db, 'usuario-a', 'materias', 'materia-1');

  await assertSucceeds(setDoc(ref, materiaValida));
  await assertSucceeds(getDoc(ref));
  await assertSucceeds(updateDoc(ref, { nome: 'Banco de Dados' }));
  await assertSucceeds(deleteDoc(ref));
});

test('matérias rejeitam campos obrigatórios ausentes', async () => {
  const db = userDb('usuario-a');

  await assertFails(
    setDoc(recordRef(db, 'usuario-a', 'materias', 'materia-1'), {
      nome: materiaValida.nome,
      professor: materiaValida.professor,
    }),
  );
});

test('matérias rejeitam tipos incorretos', async () => {
  const db = userDb('usuario-a');

  await assertFails(
    setDoc(recordRef(db, 'usuario-a', 'materias', 'materia-1'), {
      ...materiaValida,
      cor: 42,
    }),
  );
});

test('matérias rejeitam campos adicionais', async () => {
  const db = userDb('usuario-a');

  await assertFails(
    setDoc(recordRef(db, 'usuario-a', 'materias', 'materia-1'), {
      ...materiaValida,
      inesperado: true,
    }),
  );
});

test('matérias rejeitam id diferente do ID do documento', async () => {
  const db = userDb('usuario-a');

  await assertFails(
    setDoc(recordRef(db, 'usuario-a', 'materias', 'materia-1'), {
      ...materiaValida,
      id: 'outro-id',
    }),
  );
});

test('tarefas permitem criação, consulta, atualização e exclusão válidas', async () => {
  const db = userDb('usuario-a');
  const ref = recordRef(db, 'usuario-a', 'tarefas', 'tarefa-1');

  await assertSucceeds(setDoc(ref, tarefaValida));
  await assertSucceeds(getDoc(ref));
  await assertSucceeds(updateDoc(ref, { status: 'concluida' }));
  await assertSucceeds(deleteDoc(ref));
});

test('tarefas aceitam os estados pendente e concluida', async () => {
  const db = userDb('usuario-a');

  await assertSucceeds(
    setDoc(recordRef(db, 'usuario-a', 'tarefas', 'tarefa-pendente'), {
      ...tarefaValida,
      id: 'tarefa-pendente',
      status: 'pendente',
    }),
  );
  await assertSucceeds(
    setDoc(recordRef(db, 'usuario-a', 'tarefas', 'tarefa-concluida'), {
      ...tarefaValida,
      id: 'tarefa-concluida',
      status: 'concluida',
    }),
  );
});

test('tarefas rejeitam estados não permitidos', async () => {
  const db = userDb('usuario-a');

  await assertFails(
    setDoc(recordRef(db, 'usuario-a', 'tarefas', 'tarefa-1'), {
      ...tarefaValida,
      status: 'em andamento',
    }),
  );
});

test('tarefas rejeitam campos obrigatórios ausentes', async () => {
  const db = userDb('usuario-a');
  const { descricao, ...incompleta } = tarefaValida;

  await assertFails(
    setDoc(recordRef(db, 'usuario-a', 'tarefas', 'tarefa-1'), incompleta),
  );
});

test('tarefas rejeitam campos adicionais', async () => {
  const db = userDb('usuario-a');

  await assertFails(
    setDoc(recordRef(db, 'usuario-a', 'tarefas', 'tarefa-1'), {
      ...tarefaValida,
      inesperado: true,
    }),
  );
});

test('tarefas rejeitam prazo fora do formato DD/MM/AAAA', async () => {
  const db = userDb('usuario-a');

  await assertFails(
    setDoc(recordRef(db, 'usuario-a', 'tarefas', 'tarefa-1'), {
      ...tarefaValida,
      prazo: '2026-09-05',
    }),
  );
});

test('prioridade de tarefa aceita qualquer string conforme a regra atual', async () => {
  const db = userDb('usuario-a');

  await assertSucceeds(
    setDoc(recordRef(db, 'usuario-a', 'tarefas', 'tarefa-urgente'), {
      ...tarefaValida,
      id: 'tarefa-urgente',
      prioridade: 'Urgente customizada',
    }),
  );
  await assertFails(
    setDoc(recordRef(db, 'usuario-a', 'tarefas', 'tarefa-prioridade-invalida'), {
      ...tarefaValida,
      id: 'tarefa-prioridade-invalida',
      prioridade: 1,
    }),
  );
});

test('formato de prazo não garante uma data válida no calendário', async () => {
  const db = userDb('usuario-a');

  await assertSucceeds(
    setDoc(recordRef(db, 'usuario-a', 'tarefas', 'tarefa-data-impossivel'), {
      ...tarefaValida,
      id: 'tarefa-data-impossivel',
      prazo: '31/02/2026',
    }),
  );
});

test('provas permitem criação, consulta, atualização e exclusão válidas', async () => {
  const db = userDb('usuario-a');
  const ref = recordRef(db, 'usuario-a', 'provas', 'prova-1');

  await assertSucceeds(setDoc(ref, provaValida));
  await assertSucceeds(getDoc(ref));
  await assertSucceeds(updateDoc(ref, { nome: 'Avaliação de Banco de Dados' }));
  await assertSucceeds(deleteDoc(ref));
});

test('provas rejeitam campos obrigatórios ausentes', async () => {
  const db = userDb('usuario-a');
  const { data, ...incompleta } = provaValida;

  await assertFails(
    setDoc(recordRef(db, 'usuario-a', 'provas', 'prova-1'), incompleta),
  );
});

test('provas rejeitam tipos incorretos', async () => {
  const db = userDb('usuario-a');

  await assertFails(
    setDoc(recordRef(db, 'usuario-a', 'provas', 'prova-1'), {
      ...provaValida,
      data: 15092026,
    }),
  );
});

test('provas rejeitam campos adicionais', async () => {
  const db = userDb('usuario-a');

  await assertFails(
    setDoc(recordRef(db, 'usuario-a', 'provas', 'prova-1'), {
      ...provaValida,
      inesperado: true,
    }),
  );
});

test('provas rejeitam data fora do formato DD/MM/AAAA', async () => {
  const db = userDb('usuario-a');

  await assertFails(
    setDoc(recordRef(db, 'usuario-a', 'provas', 'prova-1'), {
      ...provaValida,
      data: '2026-09-15',
    }),
  );
});

test('atualização de prova aceita dados válidos e rejeita dados inválidos', async () => {
  const db = userDb('usuario-a');
  const ref = recordRef(db, 'usuario-a', 'provas', 'prova-1');

  await assertSucceeds(setDoc(ref, provaValida));
  await assertSucceeds(updateDoc(ref, { nome: 'Prova atualizada' }));
  await assertFails(updateDoc(ref, { data: 'data-invalida' }));
});

test('provas rejeitam id diferente do ID do documento', async () => {
  const db = userDb('usuario-a');

  await assertFails(
    setDoc(recordRef(db, 'usuario-a', 'provas', 'prova-1'), {
      ...provaValida,
      id: 'outro-id',
    }),
  );
});

test('formato de data de prova não garante uma data válida no calendário', async () => {
  const db = userDb('usuario-a');

  await assertSucceeds(
    setDoc(recordRef(db, 'usuario-a', 'provas', 'prova-data-impossivel'), {
      ...provaValida,
      id: 'prova-data-impossivel',
      data: '31/02/2026',
    }),
  );
});

test('regras atuais não verificam se a matéria relacionada existe', async () => {
  const db = userDb('usuario-a');

  await assertSucceeds(
    setDoc(recordRef(db, 'usuario-a', 'tarefas', 'tarefa-sem-materia'), {
      ...tarefaValida,
      id: 'tarefa-sem-materia',
      materia: 'Matéria inexistente',
    }),
  );
  await assertSucceeds(
    setDoc(recordRef(db, 'usuario-a', 'provas', 'prova-sem-materia'), {
      ...provaValida,
      id: 'prova-sem-materia',
      materia: 'Matéria inexistente',
    }),
  );
});
