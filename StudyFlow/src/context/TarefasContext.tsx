import React from 'react';
import type { Tarefa } from '../types/studyflow';
import {
  atualizarStatusTarefa,
  listarTarefasDoUsuario,
} from '../services/tarefasService';

type TarefasContextValue = {
  tarefas: Tarefa[];
  carregando: boolean;
  erroCarregamento: string | null;
  erroAtualizacao: string | null;
  recarregarTarefas: () => Promise<void>;
  alternarConclusao: (id: string) => Promise<Tarefa | null>;
};

export const TarefasContext = React.createContext<TarefasContextValue | null>(null);

export function TarefasProvider({ children }: { children: React.ReactNode }) {
  const [tarefas, setTarefas] = React.useState<Tarefa[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erroCarregamento, setErroCarregamento] = React.useState<string | null>(null);
  const [erroAtualizacao, setErroAtualizacao] = React.useState<string | null>(null);
  const componenteMontado = React.useRef(false);
  const carregamentoEmAndamento = React.useRef(false);
  const atualizacoesEmAndamento = React.useRef(new Set<string>());
  const tarefasAtuais = React.useRef<Tarefa[]>([]);

  const recarregarTarefas = React.useCallback(async () => {
    if (carregamentoEmAndamento.current) {
      return;
    }

    carregamentoEmAndamento.current = true;
    if (componenteMontado.current) {
      setCarregando(true);
      setErroCarregamento(null);
    }

    try {
      const resultado = await listarTarefasDoUsuario();
      if (componenteMontado.current) {
        tarefasAtuais.current = resultado;
        setTarefas(resultado);
      }
    } catch (error) {
      if (componenteMontado.current) {
        const codigo = typeof error === 'object' && error !== null
          && 'code' in error && typeof error.code === 'string'
          ? `${error.code}: `
          : '';
        const mensagem = error instanceof Error ? error.message : String(error);
        setErroCarregamento(`${codigo}${mensagem}`);
      }
    } finally {
      carregamentoEmAndamento.current = false;
      if (componenteMontado.current) {
        setCarregando(false);
      }
    }
  }, []);

  const alternarConclusao = React.useCallback(async (id: string) => {
    if (atualizacoesEmAndamento.current.has(id)) {
      return null;
    }

    const tarefa = tarefasAtuais.current.find((item) => item.id === id);
    if (!tarefa) {
      return null;
    }

    const status: Tarefa['status'] = tarefa.status === 'pendente' ? 'concluida' : 'pendente';
    atualizacoesEmAndamento.current.add(id);
    if (componenteMontado.current) {
      setErroAtualizacao(null);
    }

    try {
      await atualizarStatusTarefa(id, status);
      const tarefaAtualizada = { ...tarefa, status };
      if (componenteMontado.current) {
        const resultado = tarefasAtuais.current.map((item) => (
          item.id === id ? tarefaAtualizada : item
        ));
        tarefasAtuais.current = resultado;
        setTarefas(resultado);
      }
      return tarefaAtualizada;
    } catch (error) {
      if (componenteMontado.current) {
        const codigo = typeof error === 'object' && error !== null
          && 'code' in error && typeof error.code === 'string'
          ? `${error.code}: `
          : '';
        const mensagem = error instanceof Error ? error.message : String(error);
        setErroAtualizacao(`${codigo}${mensagem}`);
      }
      throw error;
    } finally {
      atualizacoesEmAndamento.current.delete(id);
    }
  }, []);

  React.useEffect(() => {
    componenteMontado.current = true;
    void recarregarTarefas();

    return () => {
      componenteMontado.current = false;
    };
  }, [recarregarTarefas]);

  return (
    <TarefasContext.Provider
      value={{
        tarefas,
        carregando,
        erroCarregamento,
        erroAtualizacao,
        recarregarTarefas,
        alternarConclusao,
      }}
    >
      {children}
    </TarefasContext.Provider>
  );
}