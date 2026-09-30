import React from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { styles, colors, spacing } from '../styles/global';
import Header from '../components/Header';
import MateriaCard from '../components/MateriaCard';
import { materias } from '../data/materias';

const MateriasScreen: React.FC = () => {
  const router = useRouter();
  const [busca, setBusca] = React.useState('');
  const temBusca = busca.trim().length > 0;
  const materiasFiltradas = materias.filter((materia) => (
    materia.nome.toLocaleLowerCase().includes(busca.trim().toLocaleLowerCase())
  ));

  return (
    <View style={styles.container}>
      <Header subtitle="Suas disciplinas acadêmicas" />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Matérias</Text>
        <Text style={styles.screenSubtitle}>{materias.length} matérias cursadas neste período</Text>

        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar matéria pelo nome"
          placeholderTextColor={colors.textLight}
          style={localStyles.searchInput}
          accessibilityLabel="Buscar matéria pelo nome"
        />

        <View style={localStyles.listContainer}>
          {materiasFiltradas.length > 0 ? (
            materiasFiltradas.map((materia) => (
              <MateriaCard
                key={materia.id}
                materia={materia}
                onPress={() => router.push({
                  pathname: '/materia-detalhes',
                  params: { id: materia.id }
                })}
              />
            ))
          ) : (
            <Text style={localStyles.emptyMessage}>
              {temBusca
                ? 'Nenhuma matéria corresponde à busca. Tente buscar por outro nome.'
                : 'Nenhuma matéria disponível no momento.'}
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
    gap: spacing.md,
    paddingBottom: spacing.xl
  },
  emptyMessage: {
    color: colors.textMuted,
    fontSize: 14
  }
});

export default MateriasScreen;
