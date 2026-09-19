import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { styles, colors, spacing } from '../styles/global';
import Header from '../components/Header';
import PrimaryButton from '../components/PrimaryButton';

const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Header subtitle="Organize seus estudos acadêmicos" />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>StudyFlow</Text>
        <Text style={localStyles.description}>
          Acompanhe suas matérias, tarefas e provas em um só lugar, de forma simples e organizada.
        </Text>

        <View style={localStyles.statsContainer}>
          <View style={localStyles.statCard}>
            <Text style={localStyles.statNumber}>4</Text>
            <Text style={localStyles.statLabel}>Matérias</Text>
          </View>
          <View style={localStyles.statCard}>
            <Text style={localStyles.statNumber}>3</Text>
            <Text style={localStyles.statLabel}>Tarefas</Text>
          </View>
          <View style={localStyles.statCard}>
            <Text style={localStyles.statNumber}>4</Text>
            <Text style={localStyles.statLabel}>Provas</Text>
          </View>
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
  description: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.xxl,
    lineHeight: 20
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl + 4,
    justifyContent: 'space-between'
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
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
    fontWeight: '500'
  }
});

export default HomeScreen;
