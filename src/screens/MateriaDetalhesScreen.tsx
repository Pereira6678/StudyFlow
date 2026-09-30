import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { styles, colors, spacing } from '../styles/global';
import Header from '../components/Header';
import { materias } from '../data/materias';

const MateriaDetalhesScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const materia = materias.find((item) => item.id === id);

  return (
    <View style={styles.container}>
      <Header subtitle="Detalhes da matéria selecionada" />
      <ScrollView style={styles.content}>
        <Pressable onPress={() => router.back()} style={localStyles.backButton}>
          <Text style={localStyles.backButtonText}>Voltar</Text>
        </Pressable>

        <Text style={styles.title}>Detalhes da Matéria</Text>

        {materia ? (
          <View style={[styles.card, localStyles.card, { borderLeftColor: materia.cor }]}>
            <View style={localStyles.cardHeader}>
              <View style={[localStyles.colorIndicator, { backgroundColor: materia.cor }]} />
              <Text style={localStyles.materiaName}>{materia.nome}</Text>
            </View>
            <View style={localStyles.divider} />
            <View style={localStyles.section}>
              <Text style={localStyles.sectionLabel}>Professor(a)</Text>
              <Text style={localStyles.sectionValue}>{materia.professor}</Text>
            </View>
          </View>
        ) : (
          <Text style={localStyles.notFound}>Matéria não encontrada.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6
  },
  backButtonText: {
    color: colors.textDark,
    fontWeight: '600'
  },
  card: {
    borderLeftWidth: 4,
    marginBottom: spacing.lg
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  colorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg
  },
  materiaName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textDark,
    flex: 1
  },
  section: {
    marginBottom: spacing.sm
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
  notFound: {
    fontSize: 14,
    color: colors.textMuted
  }
});

export default MateriaDetalhesScreen;
