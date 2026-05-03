import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';

interface Props {
  signal: 'BUY' | 'HOLD' | 'SELL';
  confidence?: number;
}

export function MLSignalBadge({ signal, confidence }: Props): React.JSX.Element {
  const color = signal === 'BUY' ? colors.success : signal === 'SELL' ? colors.danger : colors.warning;
  return <View style={[styles.badge, { borderColor: color }]}><Svg width={10} height={10}><Circle cx={5} cy={5} r={5} fill={color} /></Svg><Text style={[styles.text, { color }]}>{signal}{confidence ? ` ${confidence}%` : ''}</Text></View>;
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  text: { fontSize: 12, fontWeight: '700' },
});
