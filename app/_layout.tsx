import { useCallback, useEffect, useRef, useState } from 'react';
import { Stack } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { TarefasProvider } from '../src/context/TarefasContext';
import { ensureAuthenticatedUser } from '../src/services/anonymousAuth';
import { garantirMateriasIniciaisDoUsuario } from '../src/services/materiasService';
import { garantirProvasIniciaisDoUsuario } from '../src/services/provasService';
import { garantirTarefasIniciaisDoUsuario } from '../src/services/tarefasService';

let inicializacaoEmAndamento: Promise<void> | null = null;

function inicializarAplicacao(): Promise<void> {
  if (inicializacaoEmAndamento) {
    return inicializacaoEmAndamento;
  }

  const inicializacao = (async () => {
    const user = await ensureAuthenticatedUser();

    if (__DEV__) {
      console.info('[Auth] Session ready. UID:', user.uid);
    }

    await garantirMateriasIniciaisDoUsuario(user);
    await garantirTarefasIniciaisDoUsuario(user);
    await garantirProvasIniciaisDoUsuario(user);
  })();

  inicializacaoEmAndamento = inicializacao;
  void inicializacao.catch(() => {
    if (inicializacaoEmAndamento === inicializacao) {
      inicializacaoEmAndamento = null;
    }
  });

  return inicializacao;
}

export default function RootLayout() {
  const [estadoInicializacao, setEstadoInicializacao] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  );
  const [erroInicializacao, setErroInicializacao] = useState<string | null>(null);
  const componenteMontado = useRef(false);

  const iniciar = useCallback(() => {
    setEstadoInicializacao('loading');
    setErroInicializacao(null);

    void inicializarAplicacao()
      .then(() => {
        if (componenteMontado.current) {
          setEstadoInicializacao('ready');
        }
      })
      .catch((error: unknown) => {
        if (componenteMontado.current) {
          const mensagem = error instanceof Error ? error.message : String(error);
          setErroInicializacao(`Não foi possível preparar seus dados iniciais. ${mensagem}`);
          setEstadoInicializacao('error');
        }
      });
  }, []);

  useEffect(() => {
    componenteMontado.current = true;
    iniciar();

    return () => {
      componenteMontado.current = false;
    };
  }, [iniciar]);

  if (estadoInicializacao !== 'ready') {
    return (
      <View style={styles.container}>
        {estadoInicializacao === 'loading' ? (
          <>
            <ActivityIndicator color="#3B82F6" />
            <Text style={styles.mensagem}>Preparando seus dados...</Text>
          </>
        ) : (
          <>
            <Text style={styles.erro}>{erroInicializacao}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={iniciar}
              style={styles.botao}
            >
              <Text style={styles.textoBotao}>Tentar novamente</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  return (
    <TarefasProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#3B82F6',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 16,
          },
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'StudyFlow',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="materias"
          options={{
            title: 'Matérias',
          }}
        />
        <Stack.Screen
          name="tarefas"
          options={{
            title: 'Tarefas',
          }}
        />
        <Stack.Screen
          name="provas"
          options={{
            title: 'Provas',
          }}
        />
        <Stack.Screen
          name="tarefa-detalhes"
          options={{
            title: 'Detalhes da Tarefa',
          }}
        />
      </Stack>
    </TarefasProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  mensagem: {
    color: '#374151',
    marginTop: 12,
  },
  erro: {
    color: '#B91C1C',
    marginBottom: 16,
    textAlign: 'center',
  },
  botao: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
