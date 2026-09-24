import React from 'react';
import { tarefasIniciais } from '../data/tarefas';
import type { Tarefa } from '../types/studyflow';

type TarefasContextValue = {
  tarefas: Tarefa[];
  setTarefas: React.Dispatch<React.SetStateAction<Tarefa[]>>;
};

export const TarefasContext = React.createContext<TarefasContextValue | null>(null);

export function TarefasProvider({ children }: { children: React.ReactNode }) {
  const [tarefas, setTarefas] = React.useState<Tarefa[]>(tarefasIniciais);

  return (
    <TarefasContext.Provider value={{ tarefas, setTarefas }}>
      {children}
    </TarefasContext.Provider>
  );
}