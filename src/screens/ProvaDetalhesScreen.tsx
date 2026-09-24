import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { styles, colors, spacing } from '../styles/global';
import Header from '../components/Header';
import { provas } from '../data/provas';

const ProvaDetalhesScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const prova = provas.find((item) => item.id === id);

  return (
    <View style={styles.container}>
      <Header subtitle="Detalhes da prova selecionada" />
      <ScrollView style={styles.content}>
        <Pressable onPress={() => router.back()} style={localStyles.backButton}>
          <Text style={localStyles.backButtonText}>Voltar</Text>
        </Pressable>

        <Text style={styles.title}>Detalhes da Prova</Text>

        {prova ? (
          <View style={[styles.card, localStyles.card]}>
            <View style={localStyles.section}>
              <Text style={localStyles.sectionLabel}>Prova</Text>
              <Text style={localStyles.sectionValue}>{prova.nome}</Text>
            </View>
            <View style={localStyles.section}>
              <Text style={localStyles.sectionLabel}>Matéria</Text>
              <Text style={localStyles.sectionValue}>{prova.materia}</Text>
            </View>
            <View style={localStyles.section}>
              <Text style={localStyles.sectionLabel}>Data</Text>
              <Text style={localStyles.sectionValue}>{prova.data}</Text>
            </View>
          </View>
        ) : (
          <Text style={localStyles.notFound}>Prova não encontrada.</Text>
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
  notFound: {
    fontSize: 14,
    color: colors.textMuted
  }
});

export default ProvaDetalhesScreen;