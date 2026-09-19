import { StyleSheet } from 'react-native';

// Paleta e tokens compartilhados para manter identidade visual consistente entre telas
export const colors = {
  primary: '#3B82F6',
  primaryDark: '#1D4ED8',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  success: '#10B981',
  successBg: '#D1FAE5',
  danger: '#EF4444',
  info: '#0284C7',
  infoBg: '#E0F2FE',
  textDark: '#333',
  textMuted: '#666',
  textLight: '#999',
  border: '#E5E7EB',
  background: '#F7F7FC',
  white: '#fff'
};

export const spacing = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    alignItems: 'center',
    backgroundColor: colors.primary
  },
  headerText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600'
  },
  headerSubtitle: {
    color: colors.white,
    fontSize: 13,
    marginTop: 2,
    opacity: 0.9
  },
  content: {
    padding: spacing.xl
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: colors.textDark
  },
  screenSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.xl
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: spacing.md
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12
  },
  status: {
    marginBottom: 16,
    color: 'green',
    fontWeight: '600'
  },
  archBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  archTitle: {
    fontWeight: '700',
    marginBottom: 8
  },
  archItem: {
    fontSize: 13,
    color: '#444'
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700'
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700'
  },
  buttonTextOutline: {
    color: colors.primary,
    fontWeight: '700'
  }
});
