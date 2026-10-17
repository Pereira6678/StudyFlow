import {
  collection,
  doc,
  getDocs,
  runTransaction,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { provas } from '../data/provas';
import type { Prova } from '../types/studyflow';
import { ensureAuthenticatedUser } from './anonymousAuth';
import { db } from './firebase';
import {
  importarProvasIniciais,
  listarProvas,
} from './provasOperations';
import type { ResultadoImportacaoProvas } from './provasOperations';

const firestoreOperations = {
  collection,
  doc,
  getDocs,
  runTransaction,
};

export function listarProvasDoUsuario(): Promise<Prova[]> {
  return listarProvas(db, ensureAuthenticatedUser, firestoreOperations);
}

export function garantirProvasIniciaisDoUsuario(
  user?: Pick<User, 'uid'>,
): Promise<ResultadoImportacaoProvas> {
  return importarProvasIniciais(
    db,
    user ? async () => user : ensureAuthenticatedUser,
    provas,
    firestoreOperations,
  );
}
