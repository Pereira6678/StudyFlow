import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { styles, colors, spacing } from '../styles/global';
import Header from '../components/Header';

const ProvasScreen: React.FC = () => {
  const provas = [
    { id: '1', materia: 'Desenvolvimento Mobile', nome: 'Prova 1', data: '15/09/2026' },
    { id: '2', materia: 'Banco de Dados', nome: 'Avaliação de BD', data: '22/09/2026' },
    { id: '3', materia: 'Engenharia de Software', nome: 'Prova Prática', data: '18/09/2026' },
    { id: '4', materia: 'Programação Back-End', nome: 'Avaliação', data: '25/09/2026' }
  ];

  return (
    <View style={styles.container}>
      <Header subtitle="Calendário de avaliações" />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Provas</Text>
        <Text style={styles.screenSubtitle}>{provas.length} avaliações agendadas</Text>

        <View style={localStyles.listContainer}>
          {provas.map((prova) => (
            <View key={prova.id} style={[styles.card, localStyles.card]}>
              <View style={localStyles.dateBox}>
                <Text style={localStyles.dateText}>{prova.data}</Text>
              </View>
              <View style={localStyles.infoContainer}>
                <Text style={localStyles.cardTitle}>{prova.nome}</Text>
                <Text style={localStyles.cardMateria}>{prova.materia}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  listContainer: {
    gap: spacing.md + 2,
    paddingBottom: spacing.xl
  },
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

export default ProvasScreen;
