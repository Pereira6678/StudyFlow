import React from 'react';
import {
  Alert,
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { styles, colors, spacing } from '../styles/global';
import Header from '../components/Header';
import {
  searchOpenLibraryBooks,
  type OpenLibraryBook,
} from '../services/openLibraryService';

const BibliotecaScreen: React.FC = () => {
  const [consulta, setConsulta] = React.useState('');
  const [resultados, setResultados] = React.useState<OpenLibraryBook[]>([]);
  const [buscando, setBuscando] = React.useState(false);
  const [pesquisou, setPesquisou] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const sequenciaPesquisa = React.useRef(0);
  const componenteMontado = React.useRef(false);

  React.useEffect(() => {
    componenteMontado.current = true;
    return () => {
      componenteMontado.current = false;
      sequenciaPesquisa.current += 1;
    };
  }, []);

  const buscarLivros = async () => {
    const termo = consulta.trim();
    if (!termo) {
      setErro('Digite um título ou assunto para pesquisar.');
      setPesquisou(true);
      setResultados([]);
      return;
    }

    const pesquisaAtual = ++sequenciaPesquisa.current;
    setPesquisou(true);
    setBuscando(true);
    setErro(null);
    setResultados([]);

    try {
      const livros = await searchOpenLibraryBooks(termo);
      if (componenteMontado.current && pesquisaAtual === sequenciaPesquisa.current) {
        setResultados(livros);
      }
    } catch (error) {
      if (componenteMontado.current && pesquisaAtual === sequenciaPesquisa.current) {
        setErro(error instanceof Error ? error.message : String(error));
      }
    } finally {
      if (componenteMontado.current && pesquisaAtual === sequenciaPesquisa.current) {
        setBuscando(false);
      }
    }
  };

  const abrirObra = async (url: string) => {
    try {
      if (!/^https:\/\/openlibrary\.org\/works\/OL\d+W$/.test(url)) {
        throw new Error('O link da obra não é válido.');
      }

      await Linking.openURL(url);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : String(error);
      Alert.alert('Não foi possível abrir a página da obra', mensagem);
    }
  };

  return (
    <View style={styles.container}>
      <Header subtitle="Encontre referências para seus estudos" />
      <ScrollView style={styles.content} contentContainerStyle={localStyles.contentContainer}>
        <Text style={styles.title}>Biblioteca</Text>
        <Text style={styles.screenSubtitle}>
          Pesquise livros por título ou assunto acadêmico.
        </Text>

        <TextInput
          value={consulta}
          onChangeText={setConsulta}
          onSubmitEditing={() => void buscarLivros()}
          placeholder="Ex.: cálculo, história do Brasil"
          placeholderTextColor={colors.textLight}
          style={localStyles.searchInput}
          accessibilityLabel="Pesquisar livros por título ou assunto"
          returnKeyType="search"
        />

        <Pressable
          onPress={() => void buscarLivros()}
          disabled={!consulta.trim()}
          style={[
            styles.button,
            localStyles.searchButton,
            !consulta.trim() && localStyles.disabledButton,
          ]}
          accessibilityRole="button"
          accessibilityState={{ disabled: !consulta.trim() }}
        >
          <Text style={styles.buttonText}>Buscar</Text>
        </Pressable>

        {buscando ? (
          <View style={localStyles.statusContainer}>
            <ActivityIndicator color={colors.primary} />
            <Text style={localStyles.statusText}>Buscando livros...</Text>
          </View>
        ) : erro ? (
          <Text style={localStyles.errorText}>{erro}</Text>
        ) : pesquisou && resultados.length === 0 ? (
          <Text style={localStyles.emptyText}>Nenhum livro encontrado para essa pesquisa.</Text>
        ) : null}

        {!buscando && !erro && resultados.map((livro) => (
          <BookCard key={`${livro.key || livro.title}-${livro.firstPublishYear ?? ''}`} book={livro} onOpen={abrirObra} />
        ))}

        <Text style={localStyles.attribution}>
          Resultados bibliográficos fornecidos pela Open Library.
        </Text>
      </ScrollView>
    </View>
  );
};

function BookCard({
  book,
  onOpen,
}: {
  book: OpenLibraryBook;
  onOpen: (url: string) => void;
}) {
  const [coverFailed, setCoverFailed] = React.useState(false);
  const workUrl = book.workUrl;

  return (
    <View style={[styles.card, localStyles.bookCard]}>
      {book.coverUrl && !coverFailed ? (
        <Image
          source={{ uri: book.coverUrl }}
          style={localStyles.cover}
          resizeMode="cover"
          accessibilityLabel={`Capa do livro ${book.title}`}
          onError={() => setCoverFailed(true)}
        />
      ) : (
        <View style={[localStyles.cover, localStyles.coverPlaceholder]}>
          <Text style={localStyles.coverPlaceholderText}>Capa indisponível</Text>
        </View>
      )}

      <View style={localStyles.bookInfo}>
        <Text style={localStyles.bookTitle}>{book.title}</Text>
        <Text style={localStyles.bookMetadata}>
          {book.authors.length > 0 ? book.authors.join(', ') : 'Autores não informados'}
        </Text>
        <Text style={localStyles.bookMetadata}>
          {book.firstPublishYear ?? 'Ano de publicação indisponível'}
        </Text>
        {workUrl ? (
          <Pressable
            onPress={() => void onOpen(workUrl)}
            accessibilityRole="link"
            style={localStyles.openLink}
          >
            <Text style={localStyles.openLinkText}>Ver na Open Library</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  contentContainer: {
    paddingBottom: spacing.xl
  },
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
  searchButton: {
    marginBottom: spacing.lg
  },
  disabledButton: {
    opacity: 0.55
  },
  statusContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 14
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: spacing.lg
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: spacing.lg
  },
  bookCard: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md
  },
  cover: {
    width: 78,
    height: 116,
    borderRadius: 6,
    backgroundColor: colors.border
  },
  coverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm
  },
  coverPlaceholderText: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center'
  },
  bookInfo: {
    flex: 1,
    gap: spacing.sm
  },
  bookTitle: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '700'
  },
  bookMetadata: {
    color: colors.textMuted,
    fontSize: 13
  },
  openLink: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm
  },
  openLinkText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '600'
  },
  attribution: {
    color: colors.textLight,
    fontSize: 12,
    marginTop: spacing.lg,
    textAlign: 'center'
  }
});

export default BibliotecaScreen;
