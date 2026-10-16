import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { styles, colors, spacing } from '../styles/global';
import Header from '../components/Header';
import type { Prova } from '../types/studyflow';
import { listarProvasDoUsuario } from '../services/provasService';

const ProvaDetalhesScreen: React.FC = () => {
  const router = useRouter();
  const { id: parametroId } = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(parametroId) ? parametroId[0] : parametroId;
  const [prova, setProva] = React.useState<Prova | null>(null);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const componenteMontado = React.useRef(false);
  const consultaEmAndamento = React.useRef(false);

  const carregarProva = React.useCallback(async () => {
    if (consultaEmAndamento.current) {
      return;
    }

    consultaEmAndamento.current = true;
    if (componenteMontado.current) {
      setCarregando(true);
      setErro(null);
    }

    try {
      const provas = await listarProvasDoUsuario();
      if (componenteMontado.current) {
        setProva(provas.find((item) => item.id === id) ?? null);
      }
    } catch (error) {
      if (componenteMontado.current) {
        const codigo = typeof error === 'object' && error !== null
          && 'code' in error && typeof error.code === 'string'
          ? `${error.code}: `
          : '';
        const mensagem = error instanceof Error ? error.message : String(error);
        setErro(`${codigo}${mensagem}`);
      }
    } finally {
      consultaEmAndamento.current = false;
      if (componenteMontado.current) {
        setCarregando(false);
      }
    }
  }, [id]);

  React.useEffect(() => {
    componenteMontado.current = true;
    void carregarProva();

    return () => {
      componenteMontado.current = false;
    };
  }, [carregarProva]);

  return (
    <View style={styles.container}>
      <Header subtitle="Detalhes da prova selecionada" />
      <ScrollView style={styles.content}>
        <Pressable onPress={() => router.back()} style={localStyles.backButton}>
          <Text style={localStyles.backButtonText}>Voltar</Text>
        </Pressable>

        <Text style={styles.title}>Detalhes da Prova</Text>

        {carregando ? (
          <View style={localStyles.statusContainer}>
            <ActivityIndicator color={colors.primary} />
            <Text style={localStyles.statusMessage}>Carregando detalhes da prova...</Text>
          </View>
        ) : erro ? (
          <View style={localStyles.statusContainer}>
            <Text style={localStyles.errorMessage}>
              Não foi possível carregar os detalhes da prova: {erro}
            </Text>
            <Pressable
              onPress={() => void carregarProva()}
              style={localStyles.retryButton}
              accessibilityRole="button"
            >
              <Text style={localStyles.retryButtonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : prova ? (
          <View style={[styles.card, localStyles.card]}>
            <View style={localStyles.section}>
              <Text style={localStyles.sectionLabel}>Prova</Text>
              <Text style={localStyles.sectionValue}>{prova.nome}</Text>
            </View>
            <View style={localStyles.divider} />
            <View style={localStyles.section}>
              <Text style={localStyles.sectionLabel}>Matéria</Text>
              <Text style={localStyles.sectionValue}>{prova.materia}</Text>
            </View>
            <View style={[localStyles.section, localStyles.lastSection]}>
              <Text style={localStyles.sectionLabel}>Data</Text>
              <Text style={localStyles.sectionValue}>{prova.data}</Text>
            </View>
          </View>
        ) : (
          <Text style={localStyles.notFound}>
            {id
              ? 'Prova não encontrada.'
              : 'Não foi informado o identificador da prova.'}
          </Text>
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.lg
  },
  section: {
    marginBottom: spacing.lg
  },
  lastSection: {
    marginBottom: 0
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
  statusContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl
  },
  statusMessage: {
    color: colors.textMuted,
    fontSize: 14
  },
  errorMessage: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: spacing.md
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center'
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600'
  },
  notFound: {
    fontSize: 14,
    color: colors.textMuted
  }
});

export default ProvaDetalhesScreen;
