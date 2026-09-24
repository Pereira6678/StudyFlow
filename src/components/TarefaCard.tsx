import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { Tarefa } from '../types/studyflow';
import { styles, colors, spacing } from '../styles/global';

type Props = {
  tarefa: Tarefa;
  onPress: () => void;
};

const TarefaCard: React.FC<Props> = ({ tarefa, onPress }) => {
  const concluida = tarefa.status === 'concluida';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${concluida ? 'Desmarcar' : 'Marcar'} tarefa ${tarefa.titulo} como ${concluida ? 'pendente' : 'concluída'}`}
      style={[styles.card, concluida ? localStyles.cardConcluida : localStyles.cardPendente]}
    >
      <View style={localStyles.cardHeader}>
        <Text style={concluida ? localStyles.cardTitleConcluida : localStyles.cardTitle}>
          {concluida ? '✓ ' : ''}{tarefa.titulo}
        </Text>
        <View style={[styles.badge, { backgroundColor: concluida ? colors.success : colors.warning }]}>
          <Text style={styles.badgeText}>{concluida ? 'Concluída' : 'Pendente'}</Text>
        </View>
      </View>
      <Text style={localStyles.cardMeta}>{tarefa.materia}</Text>
      {!concluida ? <Text style={localStyles.cardPrazo}>Prazo: {tarefa.prazo}</Text> : null}
    </Pressable>
  );
};

const localStyles = StyleSheet.create({
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

export default TarefaCard;