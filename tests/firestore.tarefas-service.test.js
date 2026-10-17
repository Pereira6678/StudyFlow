require('ts-node').register({
  compiler: require.resolve('../node_modules/typescript'),
  compilerOptions: {
    ignoreDeprecations: '6.0',
    module: 'CommonJS',
    moduleResolution: 'node',
  },
  skipProject: true,
  transpileOnly: true,
});

const assert = require('node:assert/strict');
const { after, before, beforeEach, test } = require('node:test');
const { readFileSync } = require('node:fs');
const Module = require('node:module');
const net = require('node:net');
const path = require('node:path');
const {
  assertSucceeds,
  initializeTestEnvironment,
} = require('@firebase/rules-unit-testing');
const {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  setDoc,
  updateDoc,
} = require('firebase/firestore');
const {
  atualizarStatus,
  importarTarefasIniciais,
  listarTarefas,
} = require('../src/services/tarefasOperations');

const globalStylesPath = require.resolve('../src/styles/global');
const globalStylesModule = new Module(globalStylesPath, module);
globalStylesModule.filename = globalStylesPath;
globalStylesModule.loaded = true;
globalStylesModule.exports = {
  colors: {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
};
require.cache[globalStylesPath] = globalStylesModule;

const projectId = 'demo-studyflow-rules';
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
assert.ok(emulatorHost, 'Os testes devem ser executados pelo Firestore Emulator.');
const [host, portText] = emulatorHost.split(':');
assert.ok(
  host === '127.0.0.1' || host === 'localhost' || net.isIP(host) === 4 && host.startsWith('127.'),
  `Host do Firestore Emulator não local: ${host}`,
);
const port = Number(portText);
const firebaseConfig = JSON.parse(
  readFileSync(path.join(__dirname, '..', 'firebase.json'), 'utf8'),
);
assert.equal(firebaseConfig.firestore.rules, 'firestore.rules');
assert.equal(firebaseConfig.emulators.firestore.port, port);
assert.notEqual(projectId, 'studyflow-f1681');

const rules = readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8');
const {
  tarefasIniciais: tarefasDeOrigem,
} = require('../src/data/tarefas');
const firestoreOperations = {
  collection,
  doc,
  getDocs,
  runTransaction,
  updateDoc,
};

let testEnvironment;

function authenticatedDb(uid) {
  return testEnvironment.authenticatedContext(uid).firestore();
}

function authenticatedUser(uid) {
  return async () => ({ uid });
}

function tarefaCollection(db, uid) {
  return collection(db, 'usuarios', uid, 'tarefas');
}

function tarefaReference(db, uid, id) {
  return doc(db, 'usuarios', uid, 'tarefas', id);
}

async function runImport(db, uid, tarefas = tarefasDeOrigem, operations = firestoreOperations) {
  return importarTarefasIniciais(db, authenticatedUser(uid), tarefas, operations);
}

async function seedDocument(uid, id, data) {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(tarefaReference(context.firestore(), uid, id), data);
  });
}

before(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: {
      host,
      port,
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

test('consulta tarefas do próprio usuário com IDs estáveis e campos válidos', async () => {
  const uid = 'usuario-listagem';
  const db = authenticatedDb(uid);
  await seedDocument(uid, tarefasDeOrigem[0].id, tarefasDeOrigem[0]);

  const tarefas = await assertSucceeds(
    listarTarefas(db, authenticatedUser(uid), firestoreOperations),
  );

  assert.deepEqual(tarefas, [tarefasDeOrigem[0]]);
});

test('rejeita consulta quando a identidade do provedor não corresponde ao contexto', async () => {
  const uidDoToken = 'usuario-token-listagem';
  const uidDoProvedor = 'outro-usuario-listagem';
  const db = authenticatedDb(uidDoToken);
  await seedDocument(uidDoProvedor, tarefasDeOrigem[0].id, tarefasDeOrigem[0]);

  await assert.rejects(
    listarTarefas(db, authenticatedUser(uidDoProvedor), firestoreOperations),
    (error) => error.code === 'permission-denied',
  );
});

test('importa tarefas iniciais vazias usando os IDs estáveis da origem', async () => {
  const uid = 'usuario-importacao-tarefas';
  const db = authenticatedDb(uid);

  const resultado = await assertSucceeds(runImport(db, uid));
  assert.deepEqual(resultado, { status: 'imported', count: tarefasDeOrigem.length });

  const snapshot = await getDocs(tarefaCollection(db, uid));
  assert.equal(snapshot.size, tarefasDeOrigem.length);
  for (const tarefa of tarefasDeOrigem) {
    const saved = await getDoc(tarefaReference(db, uid, tarefa.id));
    assert.equal(saved.exists(), true);
    assert.deepEqual(saved.data(), tarefa);
  }
});

test('preserva documentos quando já existem tarefas na coleção', async () => {
  const uid = 'usuario-tarefas-existentes';
  const db = authenticatedDb(uid);
  const existing = {
    ...tarefasDeOrigem[0],
    titulo: 'Tarefa personalizada já existente',
  };
  await seedDocument(uid, existing.id, existing);

  const resultado = await assertSucceeds(runImport(db, uid));
  assert.deepEqual(resultado, { status: 'skipped_existing' });

  const snapshot = await getDocs(tarefaCollection(db, uid));
  assert.equal(snapshot.size, 1);
  assert.deepEqual(snapshot.docs[0].data(), existing);
});

test('segunda execução da importação não duplica nem sobrescreve tarefas', async () => {
  const uid = 'usuario-segunda-importacao';
  const db = authenticatedDb(uid);

  const primeiroResultado = await assertSucceeds(runImport(db, uid));
  assert.deepEqual(primeiroResultado, { status: 'imported', count: tarefasDeOrigem.length });
  const before = await getDocs(tarefaCollection(db, uid));
  const savedBefore = before.docs.map((document) => ({
    id: document.id,
    data: document.data(),
  }));

  const segundoResultado = await assertSucceeds(runImport(db, uid));
  assert.deepEqual(segundoResultado, { status: 'skipped_existing' });

  const after = await getDocs(tarefaCollection(db, uid));
  assert.deepEqual(
    after.docs.map((document) => ({ id: document.id, data: document.data() })),
    savedBefore,
  );
});

test('importações concorrentes mantêm os IDs estáveis sem sobrescrever documentos', async () => {
  const uid = 'usuario-importacao-concorrente';
  const firstTasks = tarefasDeOrigem;
  const secondTasks = tarefasDeOrigem.map((tarefa) => ({
    ...tarefa,
    titulo: `Versão concorrente: ${tarefa.titulo}`,
  }));

  const resultados = await Promise.all([
    runImport(authenticatedDb(uid), uid, firstTasks),
    runImport(authenticatedDb(uid), uid, secondTasks),
  ]);
  assert.deepEqual(
    resultados.map(({ status }) => status).sort(),
    ['imported', 'skipped_existing'],
  );

  const snapshot = await getDocs(tarefaCollection(authenticatedDb(uid), uid));
  assert.equal(snapshot.size, tarefasDeOrigem.length);
  for (const document of snapshot.docs) {
    assert.ok(tarefasDeOrigem.some((tarefa) => tarefa.id === document.id));
  }
});

test('atualiza status permitido sem alterar os demais campos', async () => {
  const uid = 'usuario-atualiza-status';
  const db = authenticatedDb(uid);
  const tarefa = tarefasDeOrigem[0];
  await seedDocument(uid, tarefa.id, tarefa);

  await assertSucceeds(
    atualizarStatus(db, authenticatedUser(uid), tarefa.id, 'concluida', firestoreOperations),
  );

  const saved = await getDoc(tarefaReference(db, uid, tarefa.id));
  assert.deepEqual(saved.data(), { ...tarefa, status: 'concluida' });
});

test('atualização de tarefa inexistente não cria um documento', async () => {
  const uid = 'usuario-tarefa-inexistente';
  const db = authenticatedDb(uid);

  await assert.rejects(
    atualizarStatus(
      db,
      authenticatedUser(uid),
      'tarefa-ausente',
      'concluida',
      firestoreOperations,
    ),
  );

  const missing = await getDoc(tarefaReference(db, uid, 'tarefa-ausente'));
  assert.equal(missing.exists(), false);
});

test('rejeita status não permitido antes de atualizar', async () => {
  const uid = 'usuario-status-invalido';
  const db = authenticatedDb(uid);
  const tarefa = tarefasDeOrigem[0];
  await seedDocument(uid, tarefa.id, tarefa);

  await assert.rejects(
    atualizarStatus(db, authenticatedUser(uid), tarefa.id, 'em andamento', firestoreOperations),
    /Status de tarefa inválido/,
  );

  const saved = await getDoc(tarefaReference(db, uid, tarefa.id));
  assert.equal(saved.data().status, tarefa.status);
});

test('rejeita atualização quando a identidade do provedor não corresponde ao contexto', async () => {
  const uidDoToken = 'usuario-token-status';
  const uidDoProvedor = 'outro-usuario-status';
  const tarefa = tarefasDeOrigem[0];
  await seedDocument(uidDoProvedor, tarefa.id, tarefa);

  await assert.rejects(
    atualizarStatus(
      authenticatedDb(uidDoToken),
      authenticatedUser(uidDoProvedor),
      tarefa.id,
      'concluida',
      firestoreOperations,
    ),
    (error) => error.code === 'permission-denied',
  );
});

test('propaga erro de autenticação e não inicia operação de leitura ou gravação', async () => {
  const expectedError = new Error('Falha de autenticação simulada');
  let firestoreCalls = 0;
  const trackingOperations = {
    ...firestoreOperations,
    collection: (...args) => {
      firestoreCalls += 1;
      return collection(...args);
    },
    runTransaction: (...args) => {
      firestoreCalls += 1;
      return runTransaction(...args);
    },
  };

  await assert.rejects(
    importarTarefasIniciais(
      authenticatedDb('usuario-auth-falhou'),
      async () => {
        throw expectedError;
      },
      tarefasDeOrigem,
      trackingOperations,
    ),
    (error) => error === expectedError,
  );
  assert.equal(firestoreCalls, 0);
});

test('propaga erros de leitura da coleção', async () => {
  const expectedError = Object.assign(new Error('Falha de leitura simulada'), {
    code: 'unavailable',
  });
  const operations = {
    ...firestoreOperations,
    getDocs: async () => {
      throw expectedError;
    },
  };

  await assert.rejects(
    listarTarefas(
      authenticatedDb('usuario-leitura-falhou'),
      authenticatedUser('usuario-leitura-falhou'),
      operations,
    ),
    (error) => error === expectedError,
  );
});

test('não importa documentos artificiais quando a lista de origem está vazia', async () => {
  const uid = 'usuario-sem-tarefas-de-origem';
  const db = authenticatedDb(uid);
  let firestoreCalls = 0;
  const trackingOperations = {
    ...firestoreOperations,
    collection: (...args) => {
      firestoreCalls += 1;
      return collection(...args);
    },
    runTransaction: (...args) => {
      firestoreCalls += 1;
      return runTransaction(...args);
    },
  };

  const resultado = await assertSucceeds(runImport(db, uid, [], trackingOperations));

  assert.deepEqual(resultado, { status: 'no_source' });
  assert.equal(firestoreCalls, 0);
  assert.equal((await getDocs(tarefaCollection(db, uid))).empty, true);
});

test('rejeita documentos retornados com campos incompatíveis com Tarefa', async () => {
  const uid = 'usuario-documento-invalido';
  await seedDocument(uid, 'tarefa-invalida', {
    ...tarefasDeOrigem[0],
    status: 'em andamento',
  });

  await assert.rejects(
    listarTarefas(
      authenticatedDb(uid),
      authenticatedUser(uid),
      firestoreOperations,
    ),
    /contém campos inválidos/,
  );
});
