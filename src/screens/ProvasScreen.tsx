import React from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { styles, colors, spacing } from '../styles/global';
import Header from '../components/Header';
import ProvaCard from '../components/ProvaCard';
import { provas } from '../data/provas';

const ProvasScreen: React.FC = () => {
  const router = useRouter();
  const [busca, setBusca] = React.useState('');
  const temBusca = busca.trim().length > 0;
  const termoBusca = busca.trim().toLocaleLowerCase();
  const provasFiltradas = provas.filter((prova) => (
    `${prova.nome} ${prova.materia}`.toLocaleLowerCase().includes(termoBusca)
  ));

  return (
    <View style={styles.container}>
      <Header subtitle="Calendário de avaliações" />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Provas</Text>
        <Text style={styles.screenSubtitle}>{provas.length} avaliações agendadas</Text>

        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar prova ou matéria"
          placeholderTextColor={colors.textLight}
          style={localStyles.searchInput}
          accessibilityLabel="Buscar prova ou matéria"
        />

        <View style={localStyles.listContainer}>
          {provasFiltradas.length > 0 ? (
            provasFiltradas.map((prova) => (
              <ProvaCard
                key={prova.id}
                prova={prova}
                onPress={() => router.push({
                  pathname: '/prova-detalhes',
                  params: { id: prova.id }
                })}
              />
            ))
          ) : (
            <Text style={localStyles.emptyMessage}>
              {temBusca
                ? 'Nenhuma prova corresponde à busca. Tente buscar pelo nome da prova ou da matéria.'
                : 'Nenhuma prova disponível no momento.'}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  searchInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    color: colors.textDark
  },
  listContainer: {
    gap: spacing.md + 2,
    paddingBottom: spacing.xl
  },
  emptyMessage: {
    color: colors.textMuted,
    fontSize: 14
  }
});

export default ProvasScreen;
