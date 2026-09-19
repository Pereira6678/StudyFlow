import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const items = [
  {
    key: 'native',
    title: 'Desenvolvimento Nativo',
    definition: 'Aplicações construídas usando as linguagens e SDKs específicos da plataforma (Swift/Kotlin/Java).',
    technologies: 'iOS: Swift/Obj-C; Android: Kotlin/Java',
    examples: 'Xcode, Android Studio',
    advantages: ['Máximo desempenho', 'Acesso completo a APIs nativas', 'Experiência de UI/UX consistente com plataforma'],
    disadvantages: ['Maior custo de desenvolvimento para multiplataforma', 'Código duplicado entre plataformas'],
    reuse: 'Baixo — código específico por plataforma',
    performance: 'Excelente — otimizado para cada plataforma',
    deviceAccess: 'Acesso direto e completo aos recursos do dispositivo'
  },
  {
    key: 'hybrid',
    title: 'Desenvolvimento Híbrido',
    definition: 'Aplicações web empacotadas dentro de um container nativo (WebView).',
    technologies: 'HTML, CSS, JavaScript; frameworks como Cordova, Ionic',
    examples: 'Apache Cordova, Ionic Framework',
    advantages: ['Desenvolvimento mais rápido usando skills web', 'Fácil deploy multiplataforma'],
    disadvantages: ['Desempenho inferior para animações complexas', 'Dependência do WebView'],
    reuse: 'Alto para lógica UI baseada em web, mas limitada para recursos nativos',
    performance: 'Moderado — depende muito do WebView',
    deviceAccess: 'Acesso via plugins; pode haver limitações e overhead'
  },
  {
    key: 'cross',
    title: 'Multiplataforma / Nativo Cruzado',
    definition: 'Frameworks que permitem compartilhar a maior parte do código enquanto geram componentes nativos.',
    technologies: 'React Native, Flutter, Xamarin',
    examples: 'React Native (JS), Flutter (Dart)',
    advantages: ['Alto reaproveitamento de código', 'Melhor desempenho que híbridos', 'UI próxima do nativo'],
    disadvantages: ['Algumas integrações nativas podem exigir código nativo', 'Diferenças sutis entre plataformas'],
    reuse: 'Alto — grande parte do código pode ser compartilhada',
    performance: 'Bom a muito bom — próximo do nativo dependendo do caso',
    deviceAccess: 'Acesso via módulos nativos; boa cobertura de APIs'
  }
];

const DesenvolvimentoScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Desenvolvimento Mobile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.intro}>Comparativo resumido entre modelos de desenvolvimento mobile.</Text>

        {items.map((it) => (
          <View key={it.key} style={styles.card}>
            <Text style={styles.cardTitle}>{it.title}</Text>
            <Text style={styles.cardText}>{it.definition}</Text>

            <Text style={styles.label}>Tecnologias</Text>
            <Text style={styles.value}>{it.technologies}</Text>

            <Text style={styles.label}>Exemplos de ferramentas</Text>
            <Text style={styles.value}>{it.examples}</Text>

            <Text style={styles.label}>Vantagens</Text>
            {it.advantages.map((a: string, i: number) => (
              <Text key={i} style={styles.bullet}>• {a}</Text>
            ))}

            <Text style={styles.label}>Desvantagens</Text>
            {it.disadvantages.map((d: string, i: number) => (
              <Text key={i} style={styles.bullet}>• {d}</Text>
            ))}

            <View style={styles.row}>
              <View style={styles.col}><Text style={styles.label}>Reaproveitamento</Text><Text style={styles.value}>{it.reuse}</Text></View>
              <View style={styles.col}><Text style={styles.label}>Desempenho</Text><Text style={styles.value}>{it.performance}</Text></View>
            </View>

            <Text style={styles.label}>Acesso a recursos do dispositivo</Text>
            <Text style={styles.value}>{it.deviceAccess}</Text>
          </View>
        ))}

        <View style={styles.techCard}>
          <Text style={styles.cardTitle}>Tecnologia deste projeto</Text>
          <Text style={styles.cardText}>Este projeto utiliza React Native com Expo (Managed workflow). React Native permite compartilhar lógica e componentes entre plataformas enquanto gera elementos nativos; o Expo simplifica ferramentas de build, permissões e desenvolvimento rápido.</Text>
          <Text style={[styles.label, { marginTop: 8 }]}>Por que usar aqui?</Text>
          <Text style={styles.bullet}>• Produtividade no desenvolvimento e iteração rápida</Text>
          <Text style={styles.bullet}>• Bom equilíbrio entre reaproveitamento de código e desempenho</Text>
          <Text style={styles.bullet}>• Integrado ao Ecossistema JS/React</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7FC' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 12, paddingBottom: 8, backgroundColor: '#fff' },
  backButton: { padding: 8 },
  backText: { color: '#3B82F6', fontWeight: '600' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 12, paddingBottom: 32 },
  intro: { marginBottom: 12, color: '#444' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  techCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  cardText: { color: '#333', marginBottom: 8 },
  label: { fontWeight: '700', fontSize: 12, color: '#444', marginTop: 6 },
  value: { color: '#333' },
  bullet: { color: '#333', marginLeft: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  col: { flex: 1, marginRight: 8 }
});

export default DesenvolvimentoScreen;
