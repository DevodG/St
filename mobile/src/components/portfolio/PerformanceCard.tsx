import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

export function PerformanceCard({ label, value }: { label: string; value: string }): React.JSX.Element {
  return <View style={styles.card}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.textMuted, fontSize: 12 },
  value: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 6 },
});
