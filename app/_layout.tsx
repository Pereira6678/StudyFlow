import React from 'react';
import { Stack } from 'expo-router';

export type Tarefa = {
  id: string;
  titulo: string;
  materia: string;
  descricao: string;
  prazo: string;
  status: 'pendente' | 'concluida';
};

type TarefasContextValue = {
  tarefas: Tarefa[];
  setTarefas: React.Dispatch<React.SetStateAction<Tarefa[]>>;
};

export const TarefasContext = React.createContext<TarefasContextValue | null>(null);

const tarefasIniciais: Tarefa[] = [
  { id: '1', titulo: 'Finalizar atividade de Mobile', materia: 'Desenvolvimento Mobile', descricao: 'Conclusão da atividade prática de React Native com navegação entre telas, conforme os requisitos da Sprint 1.', prazo: '05/09/2026', status: 'pendente' },
  { id: '2', titulo: 'Estudar para avaliação', materia: 'Banco de Dados', descricao: 'Revisão dos conteúdos para a avaliação.', prazo: '08/09/2026', status: 'pendente' },
  { id: '3', titulo: 'Entregar trabalho de BD', materia: 'Banco de Dados', descricao: 'Entrega do trabalho de Banco de Dados.', prazo: '10/09/2026', status: 'pendente' },
  { id: '4', titulo: 'Ler capítulo do livro', materia: 'Engenharia de Software', descricao: 'Leitura do capítulo indicado para a disciplina.', prazo: '03/09/2026', status: 'concluida' },
  { id: '5', titulo: 'Resolver exercícios', materia: 'Programação Back-End', descricao: 'Resolução dos exercícios propostos.', prazo: '07/09/2026', status: 'concluida' }
];

export default function RootLayout() {
  const [tarefas, setTarefas] = React.useState<Tarefa[]>(tarefasIniciais);

  return (
    <TarefasContext.Provider value={{ tarefas, setTarefas }}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#3B82F6',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 16,
          },
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'StudyFlow',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="materias"
          options={{
            title: 'Matérias',
          }}
        />
        <Stack.Screen
          name="tarefas"
          options={{
            title: 'Tarefas',
          }}
        />
        <Stack.Screen
          name="provas"
          options={{
            title: 'Provas',
          }}
        />
        <Stack.Screen
          name="tarefa-detalhes"
          options={{
            title: 'Detalhes da Tarefa',
          }}
        />
      </Stack>
    </TarefasContext.Provider>
  );
}
