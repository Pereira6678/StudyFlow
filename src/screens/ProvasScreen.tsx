import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { styles, colors, spacing } from '../styles/global';
import Header from '../components/Header';
import ProvaCard from '../components/ProvaCard';
import type { Prova } from '../types/studyflow';
import { listarProvasDoUsuario } from '../services/provasService';

const ProvasScreen: React.FC = () => {
  const router = useRouter();
  const [busca, setBusca] = React.useState('');
  const [provas, setProvas] = React.useState<Prova[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const componenteMontado = React.useRef(false);
  const consultaEmAndamento = React.useRef(false);

  const carregarProvas = React.useCallback(async () => {
    if (consultaEmAndamento.current) {
      return;
    }

    consultaEmAndamento.current = true;
    if (componenteMontado.current) {
      setCarregando(true);
      setErro(null);
    }

    try {
      const resultado = await listarProvasDoUsuario();
      if (componenteMontado.current) {
        setProvas(resultado);
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
  }, []);

  React.useEffect(() => {
    componenteMontado.current = true;
    void carregarProvas();

    return () => {
      componenteMontado.current = false;
    };
  }, [carregarProvas]);

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
        <Text style={styles.screenSubtitle}>
          {carregando
            ? 'Carregando avaliações...'
            : erro
              ? 'Não foi possível carregar as avaliações.'
              : `${provas.length} avaliações agendadas`}
        </Text>

        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar prova ou matéria"
          placeholderTextColor={colors.textLight}
          style={localStyles.searchInput}
          accessibilityLabel="Buscar prova ou matéria"
        />

        {carregando ? (
          <View style={localStyles.statusContainer}>
            <ActivityIndicator color={colors.primary} />
            <Text style={localStyles.statusMessage}>Carregando provas...</Text>
          </View>
        ) : erro ? (
          <View style={localStyles.statusContainer}>
            <Text style={localStyles.errorMessage}>
              Não foi possível carregar as provas: {erro}
            </Text>
            <Pressable
              onPress={() => void carregarProvas()}
              style={localStyles.retryButton}
              accessibilityRole="button"
            >
              <Text style={localStyles.retryButtonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
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
        )}
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
  }
});

export default ProvasScreen;
