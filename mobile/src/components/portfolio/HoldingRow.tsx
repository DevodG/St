import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Holding } from '../../store/portfolioStore';
import { colors } from '../../theme/colors';
import { formatCurrency, formatShares } from '../../utils/formatCurrency';
import { formatBps } from '../../utils/formatPercent';

export function HoldingRow({ holding }: { holding: Holding }): React.JSX.Element {
  return <View style={styles.row}><View><Text style={styles.symbol}>{holding.symbol}</Text><Text style={styles.meta}>{formatShares(holding.sharesTimes1000)} shares</Text></View><View style={styles.right}><Text style={styles.value}>{formatCurrency(holding.marketValueCents)}</Text><Text style={{ color: holding.unrealizedPnlCents >= 0 ? colors.success : colors.danger }}>{formatBps(holding.unrealizedPnlBps)}</Text></View></View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  symbol: { color: colors.text, fontWeight: '800', fontSize: 16 },
  meta: { color: colors.textMuted },
  right: { alignItems: 'flex-end' },
  value: { color: colors.text, fontVariant: ['tabular-nums'], fontWeight: '700' },
});
