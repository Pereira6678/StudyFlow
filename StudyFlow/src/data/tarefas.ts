import type { Tarefa } from '../types/studyflow';

export const tarefasIniciais: Tarefa[] = [
  { id: '1', titulo: 'Finalizar atividade de Mobile', materia: 'Desenvolvimento Mobile', descricao: 'Conclusão da atividade prática de React Native com navegação entre telas, conforme os requisitos da Sprint 1.', prazo: '05/09/2026', status: 'pendente', prioridade: 'Alta' },
  { id: '2', titulo: 'Estudar para avaliação', materia: 'Banco de Dados', descricao: 'Revisão dos conteúdos para a avaliação.', prazo: '08/09/2026', status: 'pendente', prioridade: 'Média' },
  { id: '3', titulo: 'Entregar trabalho de BD', materia: 'Banco de Dados', descricao: 'Entrega do trabalho de Banco de Dados.', prazo: '10/09/2026', status: 'pendente', prioridade: 'Alta' },
  { id: '4', titulo: 'Ler capítulo do livro', materia: 'Engenharia de Software', descricao: 'Leitura do capítulo indicado para a disciplina.', prazo: '03/09/2026', status: 'concluida', prioridade: 'Média' },
  { id: '5', titulo: 'Resolver exercícios', materia: 'Programação Back-End', descricao: 'Resolução dos exercícios propostos.', prazo: '07/09/2026', status: 'concluida', prioridade: 'Média' }
];