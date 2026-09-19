import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import MateriasScreen from '../screens/MateriasScreen';
import TarefasScreen from '../screens/TarefasScreen';
import ProvasScreen from '../screens/ProvasScreen';
import TarefaDetalhesScreen from '../screens/TarefaDetalhesScreen';
import ArchitecturesScreen from '../screens/ArchitecturesScreen';
import ApisScreen from '../screens/ApisScreen';
import DesenvolvimentoScreen from '../screens/DesenvolvimentoScreen';

const Stack = createNativeStackNavigator();

const AppNavigation: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#F7F7FC' }
      }}
      initialRouteName="Home"
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'StudyFlow' }}
      />
      <Stack.Screen 
        name="Materias" 
        component={MateriasScreen}
        options={{ title: 'Matérias' }}
      />
      <Stack.Screen 
        name="Tarefas" 
        component={TarefasScreen}
        options={{ title: 'Tarefas' }}
      />
      <Stack.Screen 
        name="Provas" 
        component={ProvasScreen}
        options={{ title: 'Provas' }}
      />
      <Stack.Screen 
        name="TarefaDetalhes" 
        component={TarefaDetalhesScreen}
        options={{ title: 'Detalhes da Tarefa' }}
      />
      <Stack.Screen 
        name="Architectures" 
        component={ArchitecturesScreen}
        options={{ title: 'Arquiteturas' }}
      />
      <Stack.Screen 
        name="APIs" 
        component={ApisScreen}
        options={{ title: 'APIs' }}
      />
      <Stack.Screen 
        name="Development" 
        component={DesenvolvimentoScreen}
        options={{ title: 'Desenvolvimento' }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigation;
