import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { styles, colors, spacing } from '../styles/global';
import Header from '../components/Header';
import MateriaCard from '../components/MateriaCard';
import { listarMateriasDoUsuario } from '../services/materiasService';
import type { Materia } from '../types/studyflow';

const MateriasScreen: React.FC = () => {
  const router = useRouter();
  const [busca, setBusca] = React.useState('');
  const [materias, setMaterias] = React.useState<Materia[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const componenteMontado = React.useRef(false);
  const consultaEmAndamento = React.useRef(false);

  const carregarMaterias = React.useCallback(async () => {
    if (consultaEmAndamento.current) {
      return;
    }

    consultaEmAndamento.current = true;
    setCarregando(true);
    setErro(null);

    try {
      const resultado = await listarMateriasDoUsuario();
      if (componenteMontado.current) {
        setMaterias(resultado);
      }
    } catch (error) {
      if (componenteMontado.current) {
        if (error instanceof Error) {
          const codigo = 'code' in error && typeof error.code === 'string'
            ? `${error.code}: `
            : '';
          setErro(`${codigo}${error.message}`);
        } else {
          setErro(String(error));
        }
      }
    } finally {
      consultaEmAndamento.current = false;
      if (componenteMontado.current) {
        setCarregando(false);
      }
    }
  }, []);

  React.useEffect(() => {
    componenteMontado.current = true;
    void carregarMaterias();

    return () => {
      componenteMontado.current = false;
    };
  }, [carregarMaterias]);

  const temBusca = busca.trim().length > 0;
  const materiasFiltradas = materias.filter((materia) => (
    materia.nome.toLocaleLowerCase().includes(busca.trim().toLocaleLowerCase())
  ));

  return (
    <View style={styles.container}>
      <Header subtitle="Suas disciplinas acadêmicas" />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Matérias</Text>
        <Text style={styles.screenSubtitle}>
          {carregando
            ? 'Carregando suas matérias...'
            : erro
              ? 'Não foi possível carregar suas matérias.'
              : `${materias.length} matérias cursadas neste período`}
        </Text>

        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar matéria pelo nome"
          placeholderTextColor={colors.textLight}
          style={localStyles.searchInput}
          accessibilityLabel="Buscar matéria pelo nome"
        />

        <View style={localStyles.listContainer}>
          {carregando ? (
            <View style={localStyles.statusContainer}>
              <ActivityIndicator color={colors.primary} />
              <Text style={localStyles.statusMessage}>Carregando matérias...</Text>
            </View>
          ) : erro ? (
            <View style={localStyles.errorContainer}>
              <Text style={localStyles.errorMessage}>
                Não foi possível carregar as matérias. Verifique sua conexão ou suas permissões e tente novamente.
              </Text>
              <Text style={localStyles.errorDetails}>{erro}</Text>
              <Pressable
                onPress={() => void carregarMaterias()}
                accessibilityRole="button"
                accessibilityLabel="Tentar carregar matérias novamente"
                style={localStyles.retryButton}
              >
                <Text style={localStyles.retryButtonText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : materiasFiltradas.length > 0 ? (
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
                : 'Você ainda não tem matérias cadastradas.'}
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
  statusContainer: {
    alignItems: 'center',
    gap: spacing.md
  },
  statusMessage: {
    color: colors.textMuted,
    fontSize: 14
  },
  errorContainer: {
    gap: spacing.md
  },
  errorMessage: {
    color: colors.textDark,
    fontSize: 14
  },
  errorDetails: {
    color: colors.textMuted,
    fontSize: 12
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '600'
  },
  emptyMessage: {
    color: colors.textMuted,
    fontSize: 14
  }
});

export default MateriasScreen;
