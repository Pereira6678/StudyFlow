import type { Firestore } from 'firebase/firestore';
import type { Prova } from '../types/studyflow';

type AuthenticatedUser = {
  uid: string;
};

type FirestoreOperations = Pick<
  typeof import('firebase/firestore'),
  'collection' | 'doc' | 'getDocs' | 'runTransaction'
>;

export type ResultadoImportacaoProvas =
  | { status: 'imported'; count: number }
  | { status: 'skipped_existing' }
  | { status: 'no_source' };

const camposPermitidos = ['id', 'materia', 'nome', 'data'];

function toProva(id: string, data: Record<string, unknown>): Prova {
  const { materia, nome, data: dataProva } = data;

  if (
    typeof id !== 'string' ||
    id.length === 0 ||
    Object.keys(data).some((campo) => !camposPermitidos.includes(campo)) ||
    (data.id !== undefined && data.id !== id) ||
    typeof materia !== 'string' ||
    typeof nome !== 'string' ||
    typeof dataProva !== 'string' ||
    !/^\d{2}\/\d{2}\/\d{4}$/.test(dataProva)
  ) {
    throw new Error(`O documento de prova "${id}" contém campos inválidos.`);
  }

  return { id, materia, nome, data: dataProva };
}

export async function listarProvas(
  db: Firestore,
  obterUsuarioAutenticado: () => Promise<AuthenticatedUser>,
  firestore: FirestoreOperations,
): Promise<Prova[]> {
  const user = await obterUsuarioAutenticado();
  const provasRef = firestore.collection(db, 'usuarios', user.uid, 'provas');
  const snapshot = await firestore.getDocs(provasRef);

  return snapshot.docs.map((document) => toProva(document.id, document.data()));
}

export async function importarProvasIniciais(
  db: Firestore,
  obterUsuarioAutenticado: () => Promise<AuthenticatedUser>,
  provasIniciais: readonly Prova[],
  firestore: FirestoreOperations,
): Promise<ResultadoImportacaoProvas> {
  const user = await obterUsuarioAutenticado();

  if (provasIniciais.length === 0) {
    return { status: 'no_source' };
  }

  const provasValidadas = provasIniciais.map((prova) => toProva(prova.id, prova));
  const provasRef = firestore.collection(db, 'usuarios', user.uid, 'provas');
  const documentosIniciais = provasValidadas.map((prova) => ({
    reference: firestore.doc(provasRef, prova.id),
    data: {
      id: prova.id,
      materia: prova.materia,
      nome: prova.nome,
      data: prova.data,
    },
  }));

  const snapshot = await firestore.getDocs(provasRef);
  if (!snapshot.empty) {
    return { status: 'skipped_existing' };
  }

  // A transação protege os IDs iniciais, mas não impede gravações de outros IDs após a leitura da coleção.
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
