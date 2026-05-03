import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/formatCurrency';
import { OrderConfirmModal } from './OrderConfirmModal';

interface Props {
  symbol: string;
  side: 'BUY' | 'SELL';
  priceCents: number;
  isSubmitting?: boolean;
  onSubmit: (sharesFloat: number, orderType: 'market' | 'limit', limitPriceCents: number | undefined, timeInForce: 'DAY' | 'GTC') => void;
}

export function OrderForm({ symbol, side, priceCents, isSubmitting = false, onSubmit }: Props): React.JSX.Element {
  const [shares, setShares] = useState('1');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [timeInForce, setTimeInForce] = useState<'DAY' | 'GTC'>('DAY');
  const [limitPrice, setLimitPrice] = useState('');
  const [confirming, setConfirming] = useState(false);
  const sharesFloat = Number(shares) || 0;
  const executionPriceCents = orderType === 'limit' && Number(limitPrice) > 0 ? Math.round(Number(limitPrice) * 100) : priceCents;
  const totalCents = Math.round(sharesFloat * executionPriceCents);
  const canPreview = sharesFloat > 0 && (orderType === 'market' || Number(limitPrice) > 0) && !isSubmitting;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{side} {symbol}</Text>
      <View style={styles.toggle}>
        <Pressable onPress={() => setOrderType('market')} style={[styles.toggleItem, orderType === 'market' && styles.selected]}><Text style={styles.text}>Market</Text></Pressable>
        <Pressable onPress={() => setOrderType('limit')} style={[styles.toggleItem, orderType === 'limit' && styles.selected]}><Text style={styles.text}>Limit</Text></Pressable>
      </View>
      <View style={styles.toggle}>
        <Pressable onPress={() => setTimeInForce('DAY')} style={[styles.toggleItem, timeInForce === 'DAY' && styles.selected]}><Text style={styles.text}>Day</Text></Pressable>
        <Pressable onPress={() => setTimeInForce('GTC')} style={[styles.toggleItem, timeInForce === 'GTC' && styles.selected]}><Text style={styles.text}>GTC</Text></Pressable>
      </View>
      <TextInput value={shares} onChangeText={setShares} keyboardType="decimal-pad" placeholder="Shares" placeholderTextColor={colors.textHint} style={styles.input} />
      {orderType === 'limit' ? <TextInput value={limitPrice} onChangeText={setLimitPrice} keyboardType="decimal-pad" placeholder="Limit price" placeholderTextColor={colors.textHint} style={styles.input} /> : null}
      <Text style={styles.total}>Estimated notional: {formatCurrency(totalCents)}</Text>
      <Text style={styles.disclaimer}>Paper fills use simulated liquidity, slippage, and risk checks before updating your portfolio.</Text>
      <Pressable style={[styles.button, !canPreview && styles.disabledButton]} onPress={() => setConfirming(true)} disabled={!canPreview}><Text style={styles.buttonText}>{isSubmitting ? 'Submitting...' : 'Preview Order'}</Text></Pressable>
      <OrderConfirmModal visible={confirming} symbol={symbol} totalCents={totalCents} onCancel={() => setConfirming(false)} onConfirm={() => { setConfirming(false); onSubmit(sharesFloat, orderType, orderType === 'limit' ? executionPriceCents : undefined, timeInForce); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { margin: 16, padding: 16, borderRadius: 20, backgroundColor: colors.surface, gap: 12 },
  label: { color: colors.text, fontSize: 20, fontWeight: '800' },
  toggle: { flexDirection: 'row', backgroundColor: colors.surface2, padding: 4, borderRadius: 14 },
  toggleItem: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 10 },
  selected: { backgroundColor: colors.primary },
  text: { color: colors.text, fontWeight: '700' },
  input: { color: colors.text, backgroundColor: colors.surface2, borderRadius: 14, padding: 14, fontVariant: ['tabular-nums'] },
  total: { color: colors.textMuted, fontVariant: ['tabular-nums'] },
  disclaimer: { color: colors.textHint, lineHeight: 18 },
  button: { backgroundColor: colors.primary, padding: 16, borderRadius: 14, alignItems: 'center' },
  disabledButton: { opacity: 0.45 },
  buttonText: { color: colors.text, fontWeight: '800' },
});
