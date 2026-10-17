import {
  collection,
  doc,
  getDocs,
  runTransaction,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { materias } from '../data/materias';
import type { Materia } from '../types/studyflow';
import { ensureAuthenticatedUser } from './anonymousAuth';
import { db } from './firebase';
import { importarMateriasIniciais } from './materiasImport';

function toMateria(id: string, data: Record<string, unknown>): Materia {
  const { nome, professor, cor } = data;

  if (
    typeof nome !== 'string' ||
    typeof professor !== 'string' ||
    typeof cor !== 'string'
  ) {
    throw new Error(`O documento de matéria "${id}" contém campos inválidos.`);
  }

  return { id, nome, professor, cor };
}

export async function listarMateriasDoUsuario(): Promise<Materia[]> {
  const user = await ensureAuthenticatedUser();
  const uid = user.uid;

  const snapshot = await getDocs(collection(db, 'usuarios', uid, 'materias'));
  return snapshot.docs.map((document) => toMateria(document.id, document.data()));
}

export async function garantirMateriasIniciaisDoUsuario(
  user?: Pick<User, 'uid'>,
): Promise<void> {
  await importarMateriasIniciais(db, user ? async () => user : ensureAuthenticatedUser, materias, {
    collection,
    doc,
    getDocs,
    runTransaction,
  });
}
