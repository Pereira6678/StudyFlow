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
const net = require('node:net');
const path = require('node:path');
const {
  assertFails,
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
} = require('firebase/firestore');
const {
  importarProvasIniciais,
  listarProvas,
} = require('../src/services/provasOperations');

const projectId = 'demo-studyflow-rules';
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
assert.ok(emulatorHost, 'Os testes devem ser executados pelo Firestore Emulator.');
const separatorIndex = emulatorHost.lastIndexOf(':');
const host = emulatorHost.slice(0, separatorIndex).replace(/^\[|\]$/g, '');
const port = Number(emulatorHost.slice(separatorIndex + 1));
assert.ok(
  host === 'localhost' ||
    host === '::1' ||
    (net.isIP(host) === 4 && host.startsWith('127.')),
  `Host do Firestore Emulator não local: ${host}`,
);
assert.ok(Number.isInteger(port) && port > 0, `Porta inválida do Emulator: ${port}`);

const firebaseConfig = JSON.parse(
  readFileSync(path.join(__dirname, '..', 'firebase.json'), 'utf8'),
);
assert.equal(firebaseConfig.firestore.rules, 'firestore.rules');
assert.equal(firebaseConfig.emulators.firestore.port, port);
assert.notEqual(projectId, 'studyflow-f1681');

const rules = readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8');
assert.match(rules, /match\s+\/usuarios\/\{uid\}\/provas\/\{provaId\}/);
assert.match(rules, /data\.keys\(\)\.hasAll\(\['materia',\s*'nome',\s*'data'\]\)/);
assert.match(rules, /data\.data\.matches\('\^\[0-9\]\{2\}\/\[0-9\]\{2\}\/\[0-9\]\{4\}\$'\)/);
assert.equal(
  require.cache[require.resolve('../src/services/firebase')],
  undefined,
  'A suíte não deve carregar a inicialização Firebase de produção.',
);
assert.equal(
  require.cache[require.resolve('../src/services/anonymousAuth')],
  undefined,
  'A suíte não deve carregar a autenticação de produção.',
);

const { provas: provasDeOrigem } = require('../src/data/provas');
const firestoreOperations = {
  collection,
  doc,
  getDocs,
  runTransaction,
};

let testEnvironment;

function authenticatedDb(uid) {
  return testEnvironment.authenticatedContext(uid).firestore();
}

function authenticatedUser(uid) {
  return async () => ({ uid });
}

function provaCollection(db, uid) {
  return collection(db, 'usuarios', uid, 'provas');
}

function provaReference(db, uid, id) {
  return doc(db, 'usuarios', uid, 'provas', id);
}

async function runImport(db, uid, provas = provasDeOrigem, operations = firestoreOperations) {
  return importarProvasIniciais(db, authenticatedUser(uid), provas, operations);
}

async function seedDocument(uid, id, data) {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(provaReference(context.firestore(), uid, id), data);
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

test('consulta somente as provas do usuário autenticado e retorna IDs reais', async () => {
  const uid = 'usuario-listagem-provas';
  const db = authenticatedDb(uid);
  const prova = provasDeOrigem[0];
  await seedDocument(uid, prova.id, { materia: prova.materia, nome: prova.nome, data: prova.data });

  const provas = await assertSucceeds(
    listarProvas(db, authenticatedUser(uid), firestoreOperations),
  );

  assert.deepEqual(provas, [prova]);
});

test('rejeita a consulta quando o UID autenticado não corresponde ao caminho consultado', async () => {
  const uidDoToken = 'usuario-token-provas';
  const uidDoProvedor = 'outro-usuario-provas';
  const prova = provasDeOrigem[0];
  await seedDocument(uidDoProvedor, prova.id, prova);

  await assert.rejects(
    listarProvas(
      authenticatedDb(uidDoToken),
      authenticatedUser(uidDoProvedor),
      firestoreOperations,
    ),
    (error) => error.code === 'permission-denied',
  );
});

test('importa provas iniciais com IDs estáveis e somente campos permitidos', async () => {
  const uid = 'usuario-importacao-provas';
  const db = authenticatedDb(uid);

  const resultado = await assertSucceeds(runImport(db, uid));
  assert.deepEqual(resultado, { status: 'imported', count: provasDeOrigem.length });

  const snapshot = await getDocs(provaCollection(db, uid));
  assert.equal(snapshot.size, provasDeOrigem.length);
  for (const prova of provasDeOrigem) {
    assert.equal(typeof prova.id, 'string');
    const saved = await getDoc(provaReference(db, uid, prova.id));
    assert.equal(saved.exists(), true);
    assert.deepEqual(saved.data(), prova);
    assert.deepEqual(Object.keys(saved.data()).sort(), ['data', 'id', 'materia', 'nome']);
  }
});

test('ignora a importação quando já existem provas e preserva seus dados', async () => {
  const uid = 'usuario-provas-existentes';
  const db = authenticatedDb(uid);
  const existing = {
    id: 'prova-personalizada',
    materia: 'Matéria personalizada',
    nome: 'Avaliação remarcada',
    data: '30/10/2026',
  };
  await seedDocument(uid, existing.id, existing);

  const resultado = await assertSucceeds(runImport(db, uid));

  assert.deepEqual(resultado, { status: 'skipped_existing' });
  const snapshot = await getDocs(provaCollection(db, uid));
  assert.equal(snapshot.size, 1);
  assert.deepEqual(snapshot.docs[0].data(), existing);
});

test('segunda execução não duplica nem sobrescreve provas', async () => {
  const uid = 'usuario-segunda-importacao-provas';
  const db = authenticatedDb(uid);

  assert.deepEqual(
    await assertSucceeds(runImport(db, uid)),
    { status: 'imported', count: provasDeOrigem.length },
  );
  const before = await getDocs(provaCollection(db, uid));
  const beforeData = before.docs.map((document) => ({
    id: document.id,
    data: document.data(),
  }));

  assert.deepEqual(
    await assertSucceeds(runImport(db, uid)),
    { status: 'skipped_existing' },
  );
  const after = await getDocs(provaCollection(db, uid));
  assert.deepEqual(
    after.docs.map((document) => ({ id: document.id, data: document.data() })),
    beforeData,
  );
});

test('valida documentos lidos, inclusive formato de data, ID e campos adicionais', async () => {
  const uid = 'usuario-prova-documento-invalido';
  await seedDocument(uid, 'prova-invalida', {
    id: 'id-diferente',
    materia: 'Banco de Dados',
    nome: 'Prova',
    data: '2026-09-15',
    campoExtra: true,
  });

  await assert.rejects(
    listarProvas(
      authenticatedDb(uid),
      authenticatedUser(uid),
      firestoreOperations,
    ),
    /contém campos inválidos/,
  );
});

test('regras rejeitam dados de prova inválidos sem alterar as regras', async () => {
  const db = authenticatedDb('usuario-regras-provas');

  for (const data of [
    { materia: 'Banco de Dados', nome: 'Prova' },
    { materia: 'Banco de Dados', nome: 'Prova', data: '2026-09-15' },
    { id: 'id-incorreto', materia: 'Banco de Dados', nome: 'Prova', data: '15/09/2026' },
    { materia: 'Banco de Dados', nome: 'Prova', data: '15/09/2026', campoExtra: true },
  ]) {
    await assertFails(
      setDoc(provaReference(db, 'usuario-regras-provas', `prova-${Math.random()}`), data),
    );
  }
});

test('propaga erro de autenticação sem iniciar leitura ou gravação', async () => {
  const expectedError = new Error('Falha de autenticação simulada');
  let firestoreCalls = 0;
  const trackingOperations = {
    ...firestoreOperations,
    collection: (...args) => {
      firestoreCalls += 1;
      return collection(...args);
    },
    getDocs: (...args) => {
      firestoreCalls += 1;
      return getDocs(...args);
    },
    runTransaction: (...args) => {
      firestoreCalls += 1;
      return runTransaction(...args);
    },
  };

  await assert.rejects(
    importarProvasIniciais(
      authenticatedDb('usuario-auth-provas-falhou'),
      async () => {
        throw expectedError;
      },
      provasDeOrigem,
      trackingOperations,
    ),
    (error) => error === expectedError,
  );
  assert.equal(firestoreCalls, 0);
});

test('propaga erros de leitura da listagem e da importação', async () => {
  const expectedError = Object.assign(new Error('Falha de leitura simulada'), {
    code: 'unavailable',
  });
  const unavailableOperations = {
    ...firestoreOperations,
    getDocs: async () => {
      throw expectedError;
    },
  };
  const db = authenticatedDb('usuario-leitura-provas-falhou');

  await assert.rejects(
    listarProvas(db, authenticatedUser('usuario-leitura-provas-falhou'), unavailableOperations),
    (error) => error === expectedError,
  );
  await assert.rejects(
    importarProvasIniciais(
      db,
      authenticatedUser('usuario-leitura-provas-falhou'),
      provasDeOrigem,
      unavailableOperations,
    ),
    (error) => error === expectedError,
  );
});

test('origem vazia retorna resultado explícito sem consultar ou gravar', async () => {
  const uid = 'usuario-sem-provas-de-origem';
  const db = authenticatedDb(uid);
  let firestoreCalls = 0;
  const trackingOperations = {
    ...firestoreOperations,
    collection: (...args) => {
      firestoreCalls += 1;
      return collection(...args);
    },
    getDocs: (...args) => {
      firestoreCalls += 1;
      return getDocs(...args);
    },
    runTransaction: (...args) => {
      firestoreCalls += 1;
      return runTransaction(...args);
    },
  };

  const resultado = await importarProvasIniciais(
    db,
    authenticatedUser(uid),
    [],
    trackingOperations,
  );

  assert.deepEqual(resultado, { status: 'no_source' });
  assert.equal(firestoreCalls, 0);
  assert.equal((await getDocs(provaCollection(db, uid))).empty, true);
});

test('importações concorrentes com os mesmos IDs não sobrescrevem provas', async () => {
  const uid = 'usuario-importacao-concorrente-provas';
  const modifiedSeeds = provasDeOrigem.map((prova) => ({
    ...prova,
    nome: `Versão concorrente: ${prova.nome}`,
  }));

  const resultados = await Promise.all([
    runImport(authenticatedDb(uid), uid, provasDeOrigem),
    runImport(authenticatedDb(uid), uid, modifiedSeeds),
  ]);
  assert.deepEqual(
    resultados.map(({ status }) => status).sort(),
    ['imported', 'skipped_existing'],
  );

  const snapshot = await getDocs(provaCollection(authenticatedDb(uid), uid));
  assert.equal(snapshot.size, provasDeOrigem.length);
  const saved = new Map(snapshot.docs.map((document) => [document.id, document.data()]));
  const winner = saved.get(provasDeOrigem[0].id);
  const winningSeeds = winner.nome.startsWith('Versão concorrente:')
    ? modifiedSeeds
    : provasDeOrigem;
  for (const prova of winningSeeds) {
    assert.deepEqual(saved.get(prova.id), prova);
  }
});

test('uma gravação de ID não inicial após a leitura vazia não é bloqueada pela transação', async () => {
  const uid = 'usuario-limitacao-colecao-provas';
  const db = authenticatedDb(uid);
  const externalDocument = {
    id: 'prova-concorrente-alheia',
    materia: 'Banco de Dados',
    nome: 'Prova adicionada em paralelo',
    data: '30/10/2026',
  };
  let firstRead = true;
  const racingOperations = {
    ...firestoreOperations,
    getDocs: async (reference) => {
      if (firstRead) {
        firstRead = false;
        await seedDocument(uid, externalDocument.id, externalDocument);
        return { empty: true };
      }
      return getDocs(reference);
    },
  };

  const resultado = await importarProvasIniciais(
    db,
    authenticatedUser(uid),
    provasDeOrigem,
    racingOperations,
  );

  assert.deepEqual(resultado, { status: 'imported', count: provasDeOrigem.length });
  const snapshot = await getDocs(provaCollection(db, uid));
  assert.equal(snapshot.size, provasDeOrigem.length + 1);
  assert.deepEqual(
    (await getDoc(provaReference(db, uid, externalDocument.id))).data(),
    externalDocument,
  );
});
