import React from 'react';
import { VictoryAxis, VictoryCandlestick, VictoryChart } from 'victory-native';
import { colors } from '../../theme/colors';

export interface CandleData { date: string; openCents: number; highCents: number; lowCents: number; closeCents: number }

export function CandlestickChart({ candles }: { candles: CandleData[] }): React.JSX.Element {
  return <VictoryChart height={280} padding={{ left: 56, right: 24, top: 20, bottom: 36 }}><VictoryAxis style={{ tickLabels: { fill: colors.textMuted, fontSize: 10 }, axis: { stroke: colors.border } }} /><VictoryAxis dependentAxis style={{ tickLabels: { fill: colors.textMuted, fontSize: 10 }, axis: { stroke: colors.border } }} /><VictoryCandlestick candleColors={{ positive: colors.success, negative: colors.danger }} data={candles.map((candle, index) => ({ x: index, open: candle.openCents / 100, close: candle.closeCents / 100, high: candle.highCents / 100, low: candle.lowCents / 100 }))} /></VictoryChart>;
}
