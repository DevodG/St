import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/formatCurrency';

interface Props {
  visible: boolean;
  symbol: string;
  totalCents: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function OrderConfirmModal({ visible, symbol, totalCents, onCancel, onConfirm }: Props): React.JSX.Element {
  return <Modal visible={visible} transparent animationType="fade"><View style={styles.backdrop}><View style={styles.card}><Text style={styles.title}>Preview {symbol} order</Text><Text style={styles.body}>Estimated total: {formatCurrency(totalCents)}</Text><Text style={styles.body}>Market orders include a simulated +/-0.1% slippage warning.</Text><View style={styles.row}><Pressable style={styles.secondary} onPress={onCancel}><Text style={styles.text}>Cancel</Text></Pressable><Pressable style={styles.primary} onPress={onConfirm}><Text style={styles.text}>Confirm</Text></Pressable></View></View></View></Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#00000099', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', borderRadius: 24, backgroundColor: colors.surface, padding: 20, gap: 12, borderWidth: 1, borderColor: colors.border },
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
  body: { color: colors.textMuted },
  row: { flexDirection: 'row', gap: 12 },
  secondary: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: colors.surface2, alignItems: 'center' },
  primary: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center' },
  text: { color: colors.text, fontWeight: '700' },
});
