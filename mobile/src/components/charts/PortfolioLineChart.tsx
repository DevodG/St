import React from 'react';
import { VictoryAxis, VictoryChart, VictoryLine, VictoryTheme } from 'victory-native';
import { colors } from '../../theme/colors';

export function PortfolioLineChart({ values }: { values: Array<{ date: string; valueCents: number }> }): React.JSX.Element {
  return <VictoryChart height={220} theme={VictoryTheme.material} padding={{ left: 56, right: 24, top: 20, bottom: 36 }}><VictoryAxis style={{ tickLabels: { fill: colors.textMuted, fontSize: 10 }, axis: { stroke: colors.border } }} /><VictoryAxis dependentAxis style={{ tickLabels: { fill: colors.textMuted, fontSize: 10 }, axis: { stroke: colors.border }, grid: { stroke: colors.border } }} /><VictoryLine data={values.map((point, index) => ({ x: index, y: point.valueCents / 100 }))} style={{ data: { stroke: colors.primary, strokeWidth: 3 } }} /></VictoryChart>;
}
