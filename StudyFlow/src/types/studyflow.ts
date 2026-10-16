export type Tarefa = {
  id: string;
  titulo: string;
  materia: string;
  descricao: string;
  prazo: string;
  status: 'pendente' | 'concluida';
  prioridade: string;
};

export type Materia = {
  id: string;
  nome: string;
  professor: string;
  cor: string;
};

export type Prova = {
  id: string;
  materia: string;
  nome: string;
  data: string;
};