import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import type { Prova } from '../types/studyflow';
import { styles, colors, spacing } from '../styles/global';

type Props = {
  prova: Prova;
  onPress: () => void;
};

const ProvaCard: React.FC<Props> = ({ prova, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Abrir detalhes da prova ${prova.nome}`}
    style={[styles.card, localStyles.card]}
  >
    <View style={localStyles.dateBox}>
      <Text style={localStyles.dateText}>{prova.data}</Text>
    </View>
    <View style={localStyles.infoContainer}>
      <Text style={localStyles.cardTitle}>{prova.nome}</Text>
      <Text style={localStyles.cardMateria}>{prova.materia}</Text>
    </View>
  </Pressable>
);

const localStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dateBox: {
    backgroundColor: colors.danger,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginRight: spacing.md + 2,
    minWidth: 70,
    alignItems: 'center'
  },
  dateText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700'
  },
  infoContainer: {
    flex: 1
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 4
  },
  cardMateria: {
    fontSize: 13,
    color: colors.textMuted
  }
});

export default ProvaCard;