import {
  collection,
  doc,
  getDocs,
  runTransaction,
  updateDoc,
} from 'firebase/firestore';
import { tarefasIniciais } from '../data/tarefas';
import type { Tarefa } from '../types/studyflow';
import { ensureAuthenticatedUser } from './anonymousAuth';
import { db } from './firebase';
import {
  atualizarStatus,
  importarTarefasIniciais,
  listarTarefas,
} from './tarefasOperations';
import type { ResultadoImportacaoTarefas } from './tarefasOperations';

const firestoreOperations = {
  collection,
  doc,
  getDocs,
  runTransaction,
  updateDoc,
};

export function listarTarefasDoUsuario(): Promise<Tarefa[]> {
  return listarTarefas(db, ensureAuthenticatedUser, firestoreOperations);
}

export function garantirTarefasIniciaisDoUsuario(): Promise<ResultadoImportacaoTarefas> {
  return importarTarefasIniciais(
    db,
    ensureAuthenticatedUser,
    tarefasIniciais,
    firestoreOperations,
  );
}

export function atualizarStatusTarefa(
  tarefaId: string,
  status: Tarefa['status'],
): Promise<void> {
  return atualizarStatus(
    db,
    ensureAuthenticatedUser,
    tarefaId,
    status,
    firestoreOperations,
  );
}
