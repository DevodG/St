import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  title: string;
  body: string;
}

export function EmptyState({ title, body }: Props): React.JSX.Element {
  return <View style={styles.wrap}><Text style={styles.title}>{title}</Text><Text style={styles.body}>{body}</Text></View>;
}

const styles = StyleSheet.create({
  wrap: { padding: 24, alignItems: 'center', gap: 8 },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  body: { color: colors.textMuted, textAlign: 'center' },
});
