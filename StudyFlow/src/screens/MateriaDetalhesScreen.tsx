import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { styles, colors, spacing } from '../styles/global';
import Header from '../components/Header';
import { listarMateriasDoUsuario } from '../services/materiasService';
import type { Materia } from '../types/studyflow';

const MateriaDetalhesScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [materia, setMateria] = React.useState<Materia | null>(null);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const [tentativa, setTentativa] = React.useState(0);

  React.useEffect(() => {
    let ativo = true;

    const carregarMateria = async () => {
      setCarregando(true);
      setErro(null);
      setMateria(null);

      if (!id) {
        setCarregando(false);
        return;
      }

      try {
        const materias = await listarMateriasDoUsuario();
        if (ativo) {
          setMateria(materias.find((item) => item.id === id) ?? null);
        }
      } catch (error) {
        if (ativo) {
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
        if (ativo) {
          setCarregando(false);
        }
      }
    };

    void carregarMateria();

    return () => {
      ativo = false;
    };
  }, [id, tentativa]);

  return (
    <View style={styles.container}>
      <Header subtitle="Detalhes da matéria selecionada" />
      <ScrollView style={styles.content}>
        <Pressable onPress={() => router.back()} style={localStyles.backButton}>
          <Text style={localStyles.backButtonText}>Voltar</Text>
        </Pressable>

        <Text style={styles.title}>Detalhes da Matéria</Text>

        {carregando ? (
          <View style={localStyles.statusContainer}>
            <ActivityIndicator color={colors.primary} />
            <Text style={localStyles.statusMessage}>Carregando matéria...</Text>
          </View>
        ) : erro ? (
          <View style={localStyles.errorContainer}>
            <Text style={localStyles.errorMessage}>
              Não foi possível carregar os detalhes da matéria. Verifique sua conexão ou suas permissões e tente novamente.
            </Text>
            <Text style={localStyles.errorDetails}>{erro}</Text>
            <Pressable
              onPress={() => setTentativa((valor) => valor + 1)}
              accessibilityRole="button"
              accessibilityLabel="Tentar carregar os detalhes novamente"
              style={localStyles.retryButton}
            >
              <Text style={localStyles.retryButtonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : materia ? (
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
  }
});

export default MateriaDetalhesScreen;
