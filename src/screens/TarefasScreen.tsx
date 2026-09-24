import React from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { styles, colors, spacing } from '../styles/global';
import Header from '../components/Header';
import TarefaCard from '../components/TarefaCard';
import { useTarefas } from '../hooks/useTarefas';

const TarefasScreen: React.FC = () => {
  const router = useRouter();
  const {
    tarefas,
    alternarConclusao,
    busca,
    setBusca,
    filtroStatus,
    setFiltroStatus,
    tarefasPendentes,
    tarefasConcluidas
  } = useTarefas();

  const abrirDetalhes = (tarefa: (typeof tarefas)[number]) => {
    const statusAtualizado = tarefa.status === 'pendente' ? 'concluida' : 'pendente';

    alternarConclusao(tarefa.id);
    router.push({
      pathname: '/tarefa-detalhes',
      params: {
        id: tarefa.id,
        titulo: tarefa.titulo,
        materia: tarefa.materia,
        descricao: tarefa.descricao,
        prazo: tarefa.prazo,
        status: statusAtualizado
      }
    });
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
          {tarefasPendentes.length} pendente(s) e {tarefasConcluidas.length} concluída(s)
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

        <Text style={styles.sectionTitle}>Pendentes ({tarefasPendentes.length})</Text>
        <View style={localStyles.listContainer}>
          {tarefasPendentes.map((tarefa) => (
            <TarefaCard
              key={tarefa.id}
              tarefa={tarefa}
              onPress={() => abrirDetalhes(tarefa)}
            />
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: spacing.xxl }]}>Concluídas ({tarefasConcluidas.length})</Text>
        <View style={localStyles.listContainer}>
          {tarefasConcluidas.map((tarefa) => (
            <TarefaCard
              key={tarefa.id}
              tarefa={tarefa}
              onPress={() => abrirDetalhes(tarefa)}
            />
          ))}
        </View>

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
  }
});

export default TarefasScreen;
