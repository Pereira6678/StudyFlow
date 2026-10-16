import type { Firestore } from 'firebase/firestore';
import type { Tarefa } from '../types/studyflow';

type AuthenticatedUser = {
  uid: string;
};

type FirestoreOperations = Pick<
  typeof import('firebase/firestore'),
  'collection' | 'doc' | 'getDocs' | 'runTransaction' | 'updateDoc'
>;

export type ResultadoImportacaoTarefas =
  | { status: 'imported'; count: number }
  | { status: 'skipped_existing' }
  | { status: 'no_source' };

const camposPermitidos = [
  'id',
  'titulo',
  'materia',
  'descricao',
  'prazo',
  'status',
  'prioridade',
];

function toTarefa(id: string, data: Record<string, unknown>): Tarefa {
  const { titulo, materia, descricao, prazo, status, prioridade } = data;

  if (
    Object.keys(data).some((campo) => !camposPermitidos.includes(campo)) ||
    (data.id !== undefined && data.id !== id) ||
    typeof titulo !== 'string' ||
    typeof materia !== 'string' ||
    typeof descricao !== 'string' ||
    typeof prazo !== 'string' ||
    !/^\d{2}\/\d{2}\/\d{4}$/.test(prazo) ||
    (status !== 'pendente' && status !== 'concluida') ||
    typeof prioridade !== 'string'
  ) {
    throw new Error(`O documento de tarefa "${id}" contém campos inválidos.`);
  }

  return { id, titulo, materia, descricao, prazo, status, prioridade };
}

export async function listarTarefas(
  db: Firestore,
  obterUsuarioAutenticado: () => Promise<AuthenticatedUser>,
  firestore: FirestoreOperations,
): Promise<Tarefa[]> {
  const user = await obterUsuarioAutenticado();
  const tarefasRef = firestore.collection(db, 'usuarios', user.uid, 'tarefas');
  const snapshot = await firestore.getDocs(tarefasRef);

  return snapshot.docs.map((document) => toTarefa(document.id, document.data()));
}

export async function importarTarefasIniciais(
  db: Firestore,
  obterUsuarioAutenticado: () => Promise<AuthenticatedUser>,
  tarefasIniciais: readonly Tarefa[],
  firestore: FirestoreOperations,
): Promise<ResultadoImportacaoTarefas> {
  const user = await obterUsuarioAutenticado();

  if (tarefasIniciais.length === 0) {
    return { status: 'no_source' };
  }

  const tarefasRef = firestore.collection(db, 'usuarios', user.uid, 'tarefas');
  const documentosIniciais = tarefasIniciais.map((tarefa) => {
    const validatedTask = toTarefa(tarefa.id, tarefa);

    return {
      reference: firestore.doc(tarefasRef, validatedTask.id),
      data: {
        id: validatedTask.id,
        titulo: validatedTask.titulo,
        materia: validatedTask.materia,
        descricao: validatedTask.descricao,
        prazo: validatedTask.prazo,
        status: validatedTask.status,
        prioridade: validatedTask.prioridade,
      },
    };
  });

  const snapshot = await firestore.getDocs(tarefasRef);
  if (!snapshot.empty) {
    return { status: 'skipped_existing' };
  }

  // The transaction protects the initial IDs; it cannot lock the collection against unrelated writers.
  return firestore.runTransaction(db, async (transaction) => {
    const existingDocuments = await Promise.all(
      documentosIniciais.map(({ reference }) => transaction.get(reference)),
    );

    if (existingDocuments.some((document) => document.exists())) {
      return { status: 'skipped_existing' as const };
    }

    for (const { reference, data } of documentosIniciais) {
      transaction.set(reference, data);
    }

    return { status: 'imported' as const, count: documentosIniciais.length };
  });
}

export async function atualizarStatus(
  db: Firestore,
  obterUsuarioAutenticado: () => Promise<AuthenticatedUser>,
  tarefaId: string,
  status: Tarefa['status'],
  firestore: FirestoreOperations,
): Promise<void> {
  if (status !== 'pendente' && status !== 'concluida') {
    throw new Error(`Status de tarefa inválido: ${String(status)}.`);
  }

  const user = await obterUsuarioAutenticado();
  const tarefaRef = firestore.doc(db, 'usuarios', user.uid, 'tarefas', tarefaId);

  await firestore.updateDoc(tarefaRef, { status });
}
