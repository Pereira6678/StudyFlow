import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { styles, colors, spacing } from '../styles/global';
import Header from '../components/Header';
import PrimaryButton from '../components/PrimaryButton';
import StatCard from '../components/StatCard';
import { useTarefas } from '../hooks/useTarefas';
import { materias } from '../data/materias';
import { provas } from '../data/provas';

const HomeScreen: React.FC = () => {
  const { quantidadeTarefasPendentes } = useTarefas();

  return (
    <View style={styles.container}>
      <Header subtitle="Organize seus estudos acadêmicos" />
      <ScrollView style={styles.content} contentContainerStyle={localStyles.scrollContent}>
        <Text style={styles.title}>StudyFlow</Text>
        <Text style={localStyles.description}>
          Acompanhe suas matérias, tarefas e provas em um só lugar, de forma simples e organizada.
        </Text>

        <Text style={localStyles.sectionTitle}>Resumo</Text>
        <View style={localStyles.statsContainer}>
          <StatCard value={materias.length} label="Matérias" />
          <StatCard value={quantidadeTarefasPendentes} label="Tarefas" />
          <StatCard value={provas.length} label="Provas" />
        </View>

        <Text style={styles.sectionTitle}>Acesso rápido</Text>
        <Link href="/materias" asChild>
          <PrimaryButton label="📚 Matérias" />
        </Link>
        <View style={{ height: spacing.md }} />
        <Link href="/tarefas" asChild>
          <PrimaryButton label="✓ Tarefas" />
        </Link>
        <View style={{ height: spacing.md }} />
        <Link href="/provas" asChild>
          <PrimaryButton label="📝 Provas" />
        </Link>
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xl
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.xxl,
    lineHeight: 20
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
    justifyContent: 'space-between'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: spacing.md
  }
});

export default HomeScreen;
