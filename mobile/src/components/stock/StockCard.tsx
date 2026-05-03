import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { formatBps } from '../../utils/formatPercent';
import { SparklineChart } from '../charts/SparklineChart';
import { MLSignalBadge } from './MLSignalBadge';
import { PriceTicker } from './PriceTicker';

export interface StockCardData {
  symbol: string;
  name: string;
  priceCents: number;
  changeBps: number;
}

interface Props {
  stock: StockCardData;
  onPress: () => void;
  onToggleWatch?: () => void;
}

export function StockCard({ stock, onPress, onToggleWatch }: Props): React.JSX.Element {
  const trend = [0, 1, 2, 3, 4, 5].map((item) => stock.priceCents + item * stock.changeBps);
  return <Pressable style={styles.card} onPress={onPress}><View style={styles.left}><Text style={styles.symbol}>{stock.symbol}</Text><Text style={styles.name}>{stock.name}</Text><MLSignalBadge signal={stock.changeBps >= 120 ? 'BUY' : stock.changeBps <= -120 ? 'SELL' : 'HOLD'} /></View><SparklineChart values={trend} /><View style={styles.right}><PriceTicker priceCents={stock.priceCents} /><Text style={[styles.change, { color: stock.changeBps >= 0 ? colors.success : colors.danger }]}>{formatBps(stock.changeBps)}</Text><Text onPress={onToggleWatch} style={styles.heart}>♡</Text></View></Pressable>;
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, marginHorizontal: 16, marginVertical: 6, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  left: { flex: 1, gap: 4 },
  symbol: { color: colors.text, fontSize: 18, fontWeight: '800' },
  name: { color: colors.textMuted, fontSize: 13 },
  right: { alignItems: 'flex-end', gap: 4 },
  change: { fontVariant: ['tabular-nums'], fontWeight: '700' },
  heart: { color: colors.primary, fontSize: 22 },
});
