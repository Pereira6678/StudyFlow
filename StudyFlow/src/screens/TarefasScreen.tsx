import React from 'react';
import { Pressable, ScrollView, View, Text, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { styles, colors, spacing } from '../styles/global';
import Header from '../components/Header';
import TarefaCard from '../components/TarefaCard';
import { useTarefas } from '../hooks/useTarefas';

const TarefasScreen: React.FC = () => {
  const router = useRouter();
  const componenteMontado = React.useRef(false);
  const {
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
    tarefasConcluidas
  } = useTarefas();

  React.useEffect(() => {
    componenteMontado.current = true;
    return () => {
      componenteMontado.current = false;
    };
  }, []);

  const abrirDetalhes = async (tarefa: (typeof tarefas)[number]) => {
    let tarefaAtualizada: typeof tarefa;
    try {
      const resultado = await alternarConclusao(tarefa.id);
      if (!resultado || !componenteMontado.current) {
        return;
      }
      tarefaAtualizada = resultado;
    } catch {
      return;
    }

    router.push({
      pathname: '/tarefa-detalhes',
      params: {
        id: tarefaAtualizada.id,
        titulo: tarefaAtualizada.titulo,
        materia: tarefaAtualizada.materia,
        descricao: tarefaAtualizada.descricao,
        prazo: tarefaAtualizada.prazo,
        status: tarefaAtualizada.status
      }
    });
  };

  const mensagemVazia = (status: 'pendente' | 'concluida') => {
    const nomeStatus = status === 'pendente' ? 'pendente' : 'concluída';

    return busca.trim()
      ? `Nenhuma tarefa ${nomeStatus} corresponde à busca.`
      : `Nenhuma tarefa ${nomeStatus} no momento.`;
  };

  return (
    <View style={styles.container}>
      <Header subtitle="Acompanhe suas atividades" />
      <ScrollView
        style={[styles.content, localStyles.scrollView]}
        contentContainerStyle={localStyles.scrollContent}
      >
        <Text style={styles.title}>Tarefas</Text>
        <Text style={styles.screenSubtitle}>
          {carregando
            ? 'Carregando suas tarefas...'
            : erroCarregamento
              ? 'Não foi possível carregar suas tarefas.'
              : `${tarefasPendentes.length} pendente(s) e ${tarefasConcluidas.length} concluída(s)`}
        </Text>

        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar tarefa pelo título"
          placeholderTextColor={colors.textLight}
          style={localStyles.searchInput}
          accessibilityLabel="Buscar tarefa pelo título"
        />

        <View style={localStyles.filterContainer}>
          {([
            ['todas', 'Todas'],
            ['pendentes', 'Pendentes'],
            ['concluidas', 'Concluídas']
          ] as const).map(([value, label]) => (
            <Pressable
              key={value}
              onPress={() => setFiltroStatus(value)}
              style={[localStyles.filterButton, filtroStatus === value && localStyles.filterButtonActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: filtroStatus === value }}
            >
              <Text style={[localStyles.filterButtonText, filtroStatus === value && localStyles.filterButtonTextActive]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {carregando ? (
          <View style={localStyles.statusContainer}>
            <ActivityIndicator color={colors.primary} />
            <Text style={localStyles.statusMessage}>Carregando tarefas...</Text>
          </View>
        ) : erroCarregamento ? (
          <View style={localStyles.statusContainer}>
            <Text style={localStyles.errorMessage}>
              Não foi possível carregar as tarefas: {erroCarregamento}
            </Text>
            <Pressable
              onPress={() => void recarregarTarefas()}
              style={localStyles.retryButton}
              accessibilityRole="button"
            >
              <Text style={localStyles.retryButtonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {erroAtualizacao ? (
              <Text style={localStyles.errorMessage}>
                Não foi possível salvar a alteração: {erroAtualizacao}
              </Text>
            ) : null}

            {tarefas.length === 0 ? (
              <Text style={localStyles.emptyMessage}>Nenhuma tarefa cadastrada.</Text>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Pendentes ({tarefasPendentes.length})</Text>
                <View style={localStyles.listContainer}>
                  {tarefasPendentes.length > 0
                    ? tarefasPendentes.map((tarefa) => (
                        <TarefaCard
                          key={tarefa.id}
                          tarefa={tarefa}
                          onPress={() => void abrirDetalhes(tarefa)}
                        />
                      ))
                    : filtroStatus !== 'concluidas' && (
                        <Text style={localStyles.emptyMessage}>{mensagemVazia('pendente')}</Text>
                      )}
                </View>

                <Text style={[styles.sectionTitle, { marginTop: spacing.xxl }]}>
                  Concluídas ({tarefasConcluidas.length})
                </Text>
                <View style={localStyles.listContainer}>
                  {tarefasConcluidas.length > 0
                    ? tarefasConcluidas.map((tarefa) => (
                        <TarefaCard
                          key={tarefa.id}
                          tarefa={tarefa}
                          onPress={() => void abrirDetalhes(tarefa)}
                        />
                      ))
                    : filtroStatus !== 'pendentes' && (
                        <Text style={localStyles.emptyMessage}>{mensagemVazia('concluida')}</Text>
                      )}
                </View>
              </>
            )}
          </>
        )}

      </ScrollView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: spacing.xl
  },
  listContainer: {
    gap: spacing.md
  },
  emptyMessage: {
    color: colors.textMuted,
    fontSize: 14
  },
  searchInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    color: colors.textDark
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl
  },
  filterButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.white
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  filterButtonText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600'
  },
  filterButtonTextActive: {
    color: colors.white
  },
  statusContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl
  },
  statusMessage: {
    color: colors.textMuted,
    fontSize: 14
  },
  errorMessage: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: spacing.md
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center'
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600'
  }
});

export default TarefasScreen;
