import React from 'react';
import { TarefasContext } from '../context/TarefasContext';

export type FiltroStatus = 'todas' | 'pendentes' | 'concluidas';

export function useTarefas() {
  const tarefasContext = React.useContext(TarefasContext);

  if (!tarefasContext) {
    throw new Error('TarefasContext não está disponível.');
  }

  const {
    tarefas,
    carregando,
    erroCarregamento,
    erroAtualizacao,
    recarregarTarefas,
    alternarConclusao,
  } = tarefasContext;
  const [busca, setBusca] = React.useState('');
  const [filtroStatus, setFiltroStatus] = React.useState<FiltroStatus>('todas');

  const termoBusca = busca.trim().toLocaleLowerCase();
  const tarefasFiltradas = tarefas.filter((tarefa) => {
    const correspondeAoTitulo = tarefa.titulo.toLocaleLowerCase().includes(termoBusca);
    const correspondeAoStatus = filtroStatus === 'todas'
      || (filtroStatus === 'pendentes' && tarefa.status === 'pendente')
      || (filtroStatus === 'concluidas' && tarefa.status === 'concluida');

    return correspondeAoTitulo && correspondeAoStatus;
  });

  const tarefasPendentes = tarefasFiltradas.filter((tarefa) => tarefa.status === 'pendente');
  const tarefasConcluidas = tarefasFiltradas.filter((tarefa) => tarefa.status === 'concluida');

  return {
    tarefas,
    carregando,
    erroCarregamento,
    erroAtualizacao,
    recarregarTarefas,
    alternarConclusao,
    busca,
    setBusca,
    filtroStatus,
    setFiltroStatus,
    tarefasPendentes,
    tarefasConcluidas,
    quantidadeTarefasPendentes: tarefasPendentes.length
  };
}