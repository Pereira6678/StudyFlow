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
} = require('firebase/firestore');
const { importarMateriasIniciais } = require('../src/services/materiasImport');

const firestoreOperations = {
  collection,
  doc,
  getDocs,
  runTransaction,
};

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

const { materias: materiasDeOrigem } = require('../src/data/materias');
const projectId = 'demo-studyflow-rules';
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080';
const [host, port] = emulatorHost.split(':');
const rules = readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8');

let testEnvironment;

function authenticatedDb(uid) {
  return testEnvironment.authenticatedContext(uid).firestore();
}

function authenticatedUser(uid) {
  return async () => ({ uid });
}

function materiaCollection(db, uid) {
  return collection(db, 'usuarios', uid, 'materias');
}

async function runImport(db, uid, materias = materiasDeOrigem) {
  return importarMateriasIniciais(
    db,
    authenticatedUser(uid),
    materias,
    firestoreOperations,
  );
}

async function seedDocument(uid, id, data) {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'usuarios', uid, 'materias', id), data);
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

test('importa as quatro matérias iniciais com IDs e campos permitidos', async () => {
  const uid = 'usuario-importacao-inicial';
  const db = authenticatedDb(uid);

  await assertSucceeds(runImport(db, uid));

  const snapshot = await getDocs(materiaCollection(db, uid));
  assert.equal(snapshot.size, materiasDeOrigem.length);

  for (const materia of materiasDeOrigem) {
    const saved = await getDoc(doc(db, 'usuarios', uid, 'materias', materia.id));
    assert.equal(saved.exists(), true);
    assert.deepEqual(saved.data(), materia);
    assert.deepEqual(Object.keys(saved.data()).sort(), [
      'cor',
      'id',
      'nome',
      'professor',
    ]);
  }
});

test('não altera documentos quando a coleção já contém dados', async () => {
  const uid = 'usuario-com-materias';
  const db = authenticatedDb(uid);
  const existing = {
    id: materiasDeOrigem[0].id,
    nome: 'Matéria personalizada',
    professor: 'Docente',
    cor: '#123456',
  };
  await seedDocument(uid, materiasDeOrigem[0].id, existing);

  await assertSucceeds(runImport(db, uid));

  const snapshot = await getDocs(materiaCollection(db, uid));
  assert.equal(snapshot.size, 1);
  assert.deepEqual(snapshot.docs[0].data(), existing);
});

test('uma segunda execução não duplica nem sobrescreve documentos', async () => {
  const uid = 'usuario-segunda-execucao';
  const db = authenticatedDb(uid);

  await assertSucceeds(runImport(db, uid));
  const before = await getDocs(materiaCollection(db, uid));
  const firstRun = before.docs.map((document) => ({
    id: document.id,
    data: document.data(),
  }));

  await assertSucceeds(runImport(db, uid));

  const after = await getDocs(materiaCollection(db, uid));
  assert.equal(after.size, materiasDeOrigem.length);
  assert.deepEqual(
    after.docs.map((document) => ({ id: document.id, data: document.data() })),
    firstRun,
  );
});

test('execuções concorrentes não sobrescrevem documentos com os mesmos IDs', async () => {
  const uid = 'usuario-concorrente';
  const firstClient = authenticatedDb(uid);
  const secondClient = authenticatedDb(uid);
  const modifiedSeeds = materiasDeOrigem.map((materia) => ({
    ...materia,
    nome: `Versão concorrente: ${materia.nome}`,
  }));

  await Promise.all([
    runImport(firstClient, uid, materiasDeOrigem),
    runImport(secondClient, uid, modifiedSeeds),
  ]);

  const snapshot = await getDocs(materiaCollection(firstClient, uid));
  assert.equal(snapshot.size, materiasDeOrigem.length);
  const saved = new Map(snapshot.docs.map((document) => [document.id, document.data()]));
  const firstSavedMateria = saved.get(materiasDeOrigem[0].id);
  const winnerIsModified =
    firstSavedMateria.nome === `Versão concorrente: ${materiasDeOrigem[0].nome}`;
  const winningSet = winnerIsModified
    ? modifiedSeeds
    : materiasDeOrigem;

  for (const materia of winningSet) {
    assert.deepEqual(saved.get(materia.id), materia);
  }
});

test('uma identidade não importa matérias no caminho de outra identidade', async () => {
  const uidDaIdentidade = 'usuario-autenticado';
  const uidDoToken = 'outro-token';
  const db = authenticatedDb(uidDoToken);

  await assert.rejects(
    importarMateriasIniciais(
      db,
      authenticatedUser(uidDaIdentidade),
      materiasDeOrigem,
      firestoreOperations,
    ),
    (error) => error.code === 'permission-denied',
  );

  const ownData = await getDocs(materiaCollection(authenticatedDb(uidDaIdentidade), uidDaIdentidade));
  assert.equal(ownData.empty, true);
});

test('propaga erro de autenticação e não grava documentos', async () => {
  const uid = 'usuario-auth-falhou';
  const expectedError = new Error('Falha de autenticação simulada');
  const db = authenticatedDb(uid);

  await assert.rejects(
    importarMateriasIniciais(
      db,
      async () => {
        throw expectedError;
      },
      materiasDeOrigem,
      firestoreOperations,
    ),
    (error) => error === expectedError,
  );

  const snapshot = await getDocs(materiaCollection(db, uid));
  assert.equal(snapshot.empty, true);
});

test('propaga erro de validação das regras sem gravar dados parciais', async () => {
  const uid = 'usuario-regra-rejeita';
  const db = authenticatedDb(uid);
  const materiaInvalida = [{ ...materiasDeOrigem[0], cor: 42 }];

  await assert.rejects(
    runImport(db, uid, materiaInvalida),
    (error) => error.code === 'permission-denied',
  );

  const snapshot = await getDocs(materiaCollection(db, uid));
  assert.equal(snapshot.empty, true);
});

test('propaga erros de comunicação com o Firestore', async () => {
  const uid = 'usuario-sem-rede';
  const db = authenticatedDb(uid);
  const communicationError = Object.assign(
    new Error('Falha de comunicação simulada'),
    { code: 'unavailable' },
  );
  const unavailableFirestoreOperations = {
    ...firestoreOperations,
    getDocs: async () => {
      throw communicationError;
    },
  };

  await assert.rejects(
    importarMateriasIniciais(
      db,
      authenticatedUser(uid),
      materiasDeOrigem,
      unavailableFirestoreOperations,
    ),
    (error) => error === communicationError,
  );

  const snapshot = await getDocs(materiaCollection(db, uid));
  assert.equal(snapshot.empty, true);
});

test('uma lista vazia não cria documentos artificiais', async () => {
  const uid = 'usuario-sem-materias-de-origem';
  const db = authenticatedDb(uid);

  await assertSucceeds(runImport(db, uid, []));

  const snapshot = await getDocs(materiaCollection(db, uid));
  assert.equal(snapshot.empty, true);
});
