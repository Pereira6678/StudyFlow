import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../styles/global';

type Props = {
  value: number;
  label: string;
};

const StatCard: React.FC<Props> = ({ value, label }) => (
  <View style={localStyles.statCard}>
    <Text style={localStyles.statNumber}>{value}</Text>
    <Text style={localStyles.statLabel}>{label}</Text>
  </View>
);

const localStyles = StyleSheet.create({
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
    lineHeight: 16,
    textAlign: 'center'
  }
});

export default StatCard;
