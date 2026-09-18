import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
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
  );
}
