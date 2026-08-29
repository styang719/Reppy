export const colors = {
  bg: '#0E1116',
  surface: '#171B22',
  surfaceAlt: '#1F242D',
  border: '#2A313C',
  text: '#F2F5F9',
  textMuted: '#98A2B3',
  accent: '#5B8CFF',
  accentText: '#FFFFFF',
  success: '#3DD68C',
  warning: '#F5A524',
  danger: '#F45B5B',
} as const;

export const space = (n: number) => n * 4;

export const radius = { sm: 8, md: 12, lg: 20, pill: 999 } as const;

export const type = {
  title: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
  heading: { fontSize: 20, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, lineHeight: 22, color: colors.text },
  muted: { fontSize: 13, lineHeight: 19, color: colors.textMuted },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.6, color: colors.textMuted },
};
