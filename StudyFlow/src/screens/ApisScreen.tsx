import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const apis = [
  {
    key: 'open-apis',
    name: 'APIs Abertas (Open APIs)',
    definition: 'APIs publicamente acessíveis sem necessidade de credenciais.',
    auth: 'Não (em geral)',
    example: 'Dados públicos como clima, estatísticas públicas, feeds públicos.',
    characteristic: 'Acesso livre e transparente; ideal para dados públicos.'
  },
  {
    key: 'public-auth',
    name: 'APIs Públicas com Autenticação',
    definition: 'APIs públicas que requerem chaves ou tokens para uso por terceiros.',
    auth: 'Sim — chave ou token',
    example: 'APIs que limitam uso por cliente: planos free/tiered.',
    characteristic: 'Controle de uso e monitoramento via autenticação.'
  },
  {
    key: 'paid',
    name: 'APIs Pagas / Comerciais',
    definition: 'Serviços disponibilizados mediante pagamento ou subscrição.',
    auth: 'Sim — chave + cobrança/limites',
    example: 'APIs de mapas premium, serviços de pagamento, ML comercial.',
    characteristic: 'Qualidade de serviço e suporte; SLA e limites comerciais.'
  },
  {
    key: 'partners',
    name: 'APIs de Parceiros',
    definition: 'APIs expostas a parceiros com acordos específicos.',
    auth: 'Sim — credenciais e acordos',
    example: 'Integrações B2B com troca de dados entre empresas.',
    characteristic: 'Acesso restrito e geralmente com regras contratuais.'
  },
  {
    key: 'private',
    name: 'APIs Privadas / Internas',
    definition: 'APIs usadas apenas internamente pela organização.',
    auth: 'Sim — tokens internos, VPN, ou rede privada',
    example: 'Serviços internos de catálogo, admin e back-office.',
    characteristic: 'Não expostas publicamente; foco em segurança e controle.'
  },
  {
    key: 'third-party',
    name: 'APIs de Terceiros',
    definition: 'APIs fornecidas por serviços externos que a aplicação consome.',
    auth: 'Varía — pode exigir chaves/contratos',
    example: 'APIs de redes sociais, pagamentos, análises externas.',
    characteristic: 'Dependência externa; verifique termos de uso e limites.'
  }
];

const ApisScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>APIs</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.intro}>Tipos de APIs estudados — resumo e características principais.</Text>

        {apis.map((a) => (
          <View key={a.key} style={styles.card}>
            <Text style={styles.cardTitle}>{a.name}</Text>
            <Text style={styles.cardText}>{a.definition}</Text>

            <View style={styles.row}>
              <View style={styles.col}><Text style={styles.label}>Autenticação</Text><Text style={styles.value}>{a.auth}</Text></View>
              <View style={styles.col}><Text style={styles.label}>Exemplo</Text><Text style={styles.value}>{a.example}</Text></View>
            </View>

            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>Característica principal</Text>
              <Text style={styles.value}>{a.characteristic}</Text>
            </View>
          </View>
        ))}
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
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  cardText: { color: '#333', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 1, marginRight: 8 },
  label: { fontWeight: '700', fontSize: 12, color: '#444' },
  value: { color: '#333' }
});

export default ApisScreen;
