import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { styles, colors, spacing } from '../styles/global';
import Header from '../components/Header';
import PrimaryButton from '../components/PrimaryButton';

const TarefasScreen: React.FC = () => {
  const [tarefas, setTarefas] = React.useState([
    { id: '1', titulo: 'Finalizar atividade de Mobile', materia: 'Desenvolvimento Mobile', prazo: '05/09/2026', status: 'pendente' },
    { id: '2', titulo: 'Estudar para avaliação', materia: 'Banco de Dados', prazo: '08/09/2026', status: 'pendente' },
    { id: '3', titulo: 'Entregar trabalho de BD', materia: 'Banco de Dados', prazo: '10/09/2026', status: 'pendente' },
    { id: '4', titulo: 'Ler capítulo do livro', materia: 'Engenharia de Software', prazo: '03/09/2026', status: 'concluida' },
    { id: '5', titulo: 'Resolver exercícios', materia: 'Programação Back-End', prazo: '07/09/2026', status: 'concluida' }
  ]);

  const alternarConclusao = (id: string) => {
    setTarefas((tarefasAtuais) => tarefasAtuais.map((tarefa) => (
      tarefa.id === id
        ? { ...tarefa, status: tarefa.status === 'pendente' ? 'concluida' : 'pendente' }
        : tarefa
    )));
  };

  const tarefasPendentes = tarefas.filter(t => t.status === 'pendente');
  const tarefasConcluidas = tarefas.filter(t => t.status === 'concluida');

  return (
    <View style={styles.container}>
      <Header subtitle="Acompanhe suas atividades" />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Tarefas</Text>
        <Text style={styles.screenSubtitle}>
          {tarefasPendentes.length} pendente(s) e {tarefasConcluidas.length} concluída(s)
        </Text>

        <Text style={styles.sectionTitle}>Pendentes ({tarefasPendentes.length})</Text>
        <View style={localStyles.listContainer}>
          {tarefasPendentes.map((tarefa) => (
            <Pressable
              key={tarefa.id}
              onPress={() => alternarConclusao(tarefa.id)}
              accessibilityRole="button"
              accessibilityLabel={`Marcar tarefa ${tarefa.titulo} como concluída`}
              style={[styles.card, localStyles.cardPendente]}
            >
              <View style={localStyles.cardHeader}>
                <Text style={localStyles.cardTitle}>{tarefa.titulo}</Text>
                <View style={[styles.badge, { backgroundColor: colors.warning }]}>
                  <Text style={styles.badgeText}>Pendente</Text>
                </View>
              </View>
              <Text style={localStyles.cardMeta}>{tarefa.materia}</Text>
              <Text style={localStyles.cardPrazo}>Prazo: {tarefa.prazo}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: spacing.xxl }]}>Concluídas ({tarefasConcluidas.length})</Text>
        <View style={localStyles.listContainer}>
          {tarefasConcluidas.map((tarefa) => (
            <Pressable
              key={tarefa.id}
              onPress={() => alternarConclusao(tarefa.id)}
              accessibilityRole="button"
              accessibilityLabel={`Desmarcar tarefa ${tarefa.titulo} como pendente`}
              style={[styles.card, localStyles.cardConcluida]}
            >
              <View style={localStyles.cardHeader}>
                <Text style={localStyles.cardTitleConcluida}>✓ {tarefa.titulo}</Text>
                <View style={[styles.badge, { backgroundColor: colors.success }]}>
                  <Text style={styles.badgeText}>Concluída</Text>
                </View>
              </View>
              <Text style={localStyles.cardMeta}>{tarefa.materia}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: spacing.xl, marginBottom: spacing.xl }}>
          <Link href="/tarefa-detalhes" asChild>
            <PrimaryButton label="Ver detalhes da tarefa" />
          </Link>
        </View>
      </ScrollView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  listContainer: {
    gap: spacing.md
  },
  cardPendente: {
    backgroundColor: colors.warningBg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning
  },
  cardConcluida: {
    backgroundColor: colors.successBg,
    borderLeftWidth: 4,
    borderLeftColor: colors.success
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
    flex: 1
  },
  cardTitleConcluida: {
    fontSize: 15,
    fontWeight: '600',
    color: '#059669',
    flex: 1,
    textDecorationLine: 'line-through'
  },
  cardMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4
  },
  cardPrazo: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4
  }
});

export default TarefasScreen;
