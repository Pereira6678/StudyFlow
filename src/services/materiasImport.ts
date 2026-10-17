import type { Firestore } from 'firebase/firestore';
import type { Materia } from '../types/studyflow';

type AuthenticatedUser = {
  uid: string;
};

type FirestoreOperations = Pick<
  typeof import('firebase/firestore'),
  'collection' | 'doc' | 'getDocs' | 'runTransaction'
>;

export async function importarMateriasIniciais(
  db: Firestore,
  obterUsuarioAutenticado: () => Promise<AuthenticatedUser>,
  materiasIniciais: readonly Materia[],
  firestore: FirestoreOperations,
): Promise<void> {
  const user = await obterUsuarioAutenticado();
  const materiasRef = firestore.collection(db, 'usuarios', user.uid, 'materias');
  const snapshot = await firestore.getDocs(materiasRef);

  if (!snapshot.empty || materiasIniciais.length === 0) {
    return;
  }

  const documentosIniciais = materiasIniciais.map((materia) => ({
    reference: firestore.doc(materiasRef, materia.id),
    data: {
      id: materia.id,
      nome: materia.nome,
      professor: materia.professor,
      cor: materia.cor,
    },
  }));

  await firestore.runTransaction(db, async (transaction) => {
    const snapshots = await Promise.all(
      documentosIniciais.map(({ reference }) => transaction.get(reference)),
    );

    if (snapshots.some((document) => document.exists())) {
      return;
    }

    for (const { reference, data } of documentosIniciais) {
      transaction.set(reference, data);
    }
  });
}
