import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { TarefasProvider } from '../src/context/TarefasContext';
import { ensureAuthenticatedUser } from '../src/services/anonymousAuth';

export default function RootLayout() {
  useEffect(() => {
    ensureAuthenticatedUser()
      .then((user) => {
        if (__DEV__) {
          console.info('[Auth] Session ready. UID:', user.uid);
        }
      })
      .catch((error: unknown) => {
        console.error('[Auth] Initial authentication failed:', error);
      });
  }, []);

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
