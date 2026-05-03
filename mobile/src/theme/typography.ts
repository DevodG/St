import type { TextStyle } from 'react-native';

export const typography = {
  h1: { fontSize: 34, lineHeight: 40, fontWeight: '700' } satisfies TextStyle,
  h2: { fontSize: 24, lineHeight: 30, fontWeight: '700' } satisfies TextStyle,
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '600' } satisfies TextStyle,
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' } satisfies TextStyle,
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' } satisfies TextStyle,
  number: { fontVariant: ['tabular-nums'], fontWeight: '600' } satisfies TextStyle,
};
