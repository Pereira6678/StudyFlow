import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const items = [
  {
    key: 'local-first',
    name: 'Local-First / On-Device',
    short: 'Dados e lógica primariamente no dispositivo.',
    how: 'Aplicação funciona plenamente no dispositivo, persistindo dados localmente.',
    online: 'Sincronizações pontuais; internet não requerida para uso básico.',
    offline: 'Totalmente funcional offline; todas as operações locais.',
    localDB: 'Sim — banco local (SQLite, Realm, AsyncStorage).',
    server: 'Opcional; usado só para backups ou sharing.',
    advantages: ['Rapidez', 'Privacidade', 'Disponibilidade offline'],
    limitations: ['Sincronização complicada', 'Consumo local de armazenamento']
  },
  {
    key: 'client-server-online-first',
    name: 'Cliente-Servidor + Online-First',
    short: 'Prioriza dados em servidor; cliente busca sempre o mais recente.',
    how: 'Cliente requisita/atualiza dados no servidor; cache local mínimo.',
    online: 'Dados atualizados em tempo real; operações dependem da API.',
    offline: 'Funcionalidade reduzida; pode mostrar cache limitado ou erro.',
    localDB: 'Cache temporário possível; não essencial.',
    server: 'Sim — servidor/API central é fonte de verdade.',
    advantages: ['Consistência central', 'Fácil governança de dados'],
    limitations: ['Dependência de conexão', 'Latência em redes ruins']
  },
  {
    key: 'client-server-offline-first',
    name: 'Cliente-Servidor + Offline-First',
    short: 'Cliente prioriza operar offline e sincronizar depois.',
    how: 'Aplicação opera contra banco local; alterações sincronizam com servidor.',
    online: 'Sincronização bidirecional e resolução de conflitos.',
    offline: 'Totalmente utilizável; filas de sincronização locais.',
    localDB: 'Sim — base local robusta para operações.',
    server: 'Sim — aceita e resolve atualizações durante sync.',
    advantages: ['Excelente UX offline', 'Responsividade'],
    limitations: ['Complexidade de sync', 'Resolução de conflitos']
  },
  {
    key: 'sync-architecture',
    name: 'Sync Architecture',
    short: 'Foco em sincronização eficiente entre dispositivos e servidor.',
    how: 'Utiliza mecanismos de log/operational transforms ou CRDTs para sync.',
    online: 'Sincronizações contínuas ou por lotes; consistência eventual.',
    offline: 'Permite mudanças offline que serão reconciliadas depois.',
    localDB: 'Sim — mantém estado e operações locais antes do sync.',
    server: 'Sim — servidor coordena merges e histórico de operações.',
    advantages: ['Escalável para colaboração', 'Resiliência a falhas de rede'],
    limitations: ['Implementação complexa', 'Possível inconsistência temporária']
  }
];

const Indicator: React.FC<{ label: string; active?: boolean; color?: string }> = ({ label, active, color = '#555' }) => (
  <View style={localStyles.indicatorRow}>
    <View style={[localStyles.dot, { backgroundColor: active ? color : '#ddd' }]} />
    <Text style={localStyles.indicatorText}>{label}</Text>
  </View>
);

const ArchitecturesScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={localStyles.container}>
      <View style={localStyles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={localStyles.backButton}>
          <Text style={localStyles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={localStyles.headerTitle}>Arquiteturas Mobile</Text>
      </View>

      <ScrollView contentContainerStyle={localStyles.scroll}>
        {items.map((it) => (
          <View key={it.key} style={localStyles.card}>
            <Text style={localStyles.cardTitle}>{it.name}</Text>
            <Text style={localStyles.short}>{it.short}</Text>

            <View style={localStyles.section}>
              <Text style={localStyles.sectionTitle}>Funcionamento</Text>
              <Text style={localStyles.sectionText}>{it.how}</Text>
            </View>

            <View style={localStyles.row}>
              <View style={localStyles.col}>
                <Text style={localStyles.sectionSubtitle}>Com internet</Text>
                <Text style={localStyles.smallText}>{it.online}</Text>
              </View>
              <View style={localStyles.col}>
                <Text style={localStyles.sectionSubtitle}>Sem internet</Text>
                <Text style={localStyles.smallText}>{it.offline}</Text>
              </View>
            </View>

            <View style={localStyles.rowIndicators}>
              <Indicator label="Internet" active={true} color="#10B981" />
              <Indicator label="API/Servidor" active={it.server?.startsWith('Sim')} color="#3B82F6" />
              <Indicator label="Banco Local" active={it.localDB?.startsWith('Sim')} color="#F59E0B" />
              <Indicator label="Banco Nuvem" active={it.server?.startsWith('Sim')} color="#8B5CF6" />
            </View>

            <View style={localStyles.section}>
              <Text style={localStyles.sectionTitle}>Vantagens</Text>
              {it.advantages.map((a, i) => (
                <Text key={i} style={localStyles.bullet}>• {a}</Text>
              ))}
            </View>

            <View style={localStyles.section}>
              <Text style={localStyles.sectionTitle}>Limitações</Text>
              {it.limitations.map((l, i) => (
                <Text key={i} style={localStyles.bullet}>• {l}</Text>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7FC' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 12, paddingBottom: 8, backgroundColor: '#fff' },
  backButton: { padding: 8 },
  backText: { color: '#3B82F6', fontWeight: '600' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 12, paddingBottom: 32 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  short: { fontSize: 13, color: '#444', marginBottom: 8 },
  section: { marginTop: 6 },
  sectionTitle: { fontWeight: '700', marginBottom: 4 },
  sectionText: { color: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  col: { flex: 1, marginRight: 8 },
  sectionSubtitle: { fontWeight: '600' },
  smallText: { color: '#444' },
  rowIndicators: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  indicatorRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 6, marginRight: 6 },
  indicatorText: { fontSize: 12, color: '#555', marginRight: 8 },
  bullet: { color: '#333', marginLeft: 6 }
});

export default ArchitecturesScreen;
