import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { styles, colors, spacing } from '../styles/global';
import Header from '../components/Header';

const TarefaDetalhesScreen: React.FC = () => {
  const tarefa = {
    id: '1',
    titulo: 'Finalizar atividade de Mobile',
    materia: 'Desenvolvimento Mobile',
    descricao: 'Conclusão da atividade prática de React Native com navegação entre telas, conforme os requisitos da Sprint 1.',
    prazo: '05/09/2026',
    status: 'pendente',
    prioridade: 'Alta'
  };

  const getStatusColor = (status: string) => {
    return status === 'pendente' ? colors.warning : colors.success;
  };

  const getStatusLabel = (status: string) => {
    return status === 'pendente' ? 'Pendente' : 'Concluída';
  };

  return (
    <View style={styles.container}>
      <Header subtitle="Detalhes da tarefa selecionada" />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Detalhes da Tarefa</Text>

        <View style={[styles.card, localStyles.card]}>
          <View style={localStyles.header}>
            <Text style={localStyles.titleMain}>{tarefa.titulo}</Text>
            <View style={[styles.badge, { backgroundColor: getStatusColor(tarefa.status) }]}>
              <Text style={styles.badgeText}>{getStatusLabel(tarefa.status)}</Text>
            </View>
          </View>

          <View style={localStyles.divider} />

          <View style={localStyles.section}>
            <Text style={localStyles.sectionLabel}>Matéria</Text>
            <Text style={localStyles.sectionValue}>{tarefa.materia}</Text>
          </View>

          <View style={localStyles.section}>
            <Text style={localStyles.sectionLabel}>Descrição</Text>
            <Text style={localStyles.sectionValue}>{tarefa.descricao}</Text>
          </View>

          <View style={localStyles.rowContainer}>
            <View style={localStyles.inlineSection}>
              <Text style={localStyles.sectionLabel}>Prazo</Text>
              <Text style={localStyles.sectionValue}>{tarefa.prazo}</Text>
            </View>
            <View style={localStyles.inlineSection}>
              <Text style={localStyles.sectionLabel}>Prioridade</Text>
              <Text style={[localStyles.sectionValue, { color: colors.danger }]}>
                {tarefa.prioridade}
              </Text>
            </View>
          </View>
        </View>

        <View style={localStyles.infoBox}>
          <Text style={localStyles.infoText}>
            📌 Esta tela demonstra os detalhes de uma tarefa. Os dados são estáticos para fins de demonstração.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    gap: spacing.md
  },
  titleMain: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
    flex: 1
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.lg
  },
  section: {
    marginBottom: spacing.lg
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  sectionValue: {
    fontSize: 15,
    color: colors.textDark,
    lineHeight: 22
  },
  rowContainer: {
    flexDirection: 'row',
    gap: spacing.lg
  },
  inlineSection: {
    flex: 1,
    marginTop: spacing.sm
  },
  infoBox: {
    backgroundColor: colors.infoBg,
    borderRadius: 8,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.info
  },
  infoText: {
    fontSize: 13,
    color: '#0369A1',
    lineHeight: 19
  }
});

export default TarefaDetalhesScreen;
