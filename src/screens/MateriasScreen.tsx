import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { styles, colors, spacing } from '../styles/global';
import Header from '../components/Header';

const MateriasScreen: React.FC = () => {
  const materias = [
    { id: '1', nome: 'Desenvolvimento Mobile', professor: 'Kellen Nery', cor: colors.primary },
    { id: '2', nome: 'Banco de Dados', professor: 'A definir', cor: colors.success },
    { id: '3', nome: 'Engenharia de Software', professor: 'A definir', cor: colors.warning },
    { id: '4', nome: 'Programação Back-End', professor: 'A definir', cor: colors.danger }
  ];

  return (
    <View style={styles.container}>
      <Header subtitle="Suas disciplinas acadêmicas" />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Matérias</Text>
        <Text style={styles.screenSubtitle}>{materias.length} matérias cursadas neste período</Text>

        <View style={localStyles.listContainer}>
          {materias.map((materia) => (
            <View key={materia.id} style={[styles.card, localStyles.card, { borderLeftColor: materia.cor }]}>
              <Text style={localStyles.cardTitle}>{materia.nome}</Text>
              <Text style={localStyles.cardSubtitle}>Professor(a): {materia.professor}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  listContainer: {
    gap: spacing.md,
    paddingBottom: spacing.xl
  },
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

export default MateriasScreen;
