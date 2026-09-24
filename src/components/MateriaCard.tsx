import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import type { Materia } from '../types/studyflow';
import { styles, colors } from '../styles/global';

type Props = {
  materia: Materia;
  onPress: () => void;
};

const MateriaCard: React.FC<Props> = ({ materia, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Abrir detalhes da matéria ${materia.nome}`}
    style={[styles.card, localStyles.card, { borderLeftColor: materia.cor }]}
  >
    <Text style={localStyles.cardTitle}>{materia.nome}</Text>
    <Text style={localStyles.cardSubtitle}>Professor(a): {materia.professor}</Text>
  </Pressable>
);

const localStyles = StyleSheet.create({
  card: {
    borderLeftWidth: 4
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 4
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textMuted
  }
});

export default MateriaCard;