import React from 'react';
import { View } from 'react-native';
import { VictoryLine } from 'victory-native';
import { colors } from '../../theme/colors';

export function SparklineChart({ values }: { values: number[] }): React.JSX.Element {
  return <View pointerEvents="none"><VictoryLine width={96} height={36} padding={4} data={values.map((y, x) => ({ x, y }))} style={{ data: { stroke: colors.primary, strokeWidth: 2 } }} /></View>;
}
