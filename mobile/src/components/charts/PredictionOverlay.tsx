import React from 'react';
import { VictoryArea, VictoryChart, VictoryLine } from 'victory-native';
import { colors } from '../../theme/colors';

export function PredictionOverlay({ prices, upper, lower }: { prices: number[]; upper: number[]; lower: number[] }): React.JSX.Element {
  const area = prices.map((price, index) => ({ x: index, y: price, y0: lower[index] ?? price }));
  return <VictoryChart height={180} padding={{ left: 48, right: 20, top: 16, bottom: 24 }}><VictoryArea data={area.map((point, index) => ({ ...point, y: upper[index] ?? point.y }))} style={{ data: { fill: `${colors.primary}22`, strokeWidth: 0 } }} /><VictoryLine data={prices.map((price, index) => ({ x: index, y: price }))} style={{ data: { stroke: colors.primary, strokeWidth: 2, strokeDasharray: '5,5' } }} /></VictoryChart>;
}
