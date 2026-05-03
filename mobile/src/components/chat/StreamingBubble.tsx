import React from 'react';
import { Text } from 'react-native';
import { colors } from '../../theme/colors';

export function StreamingBubble(): React.JSX.Element {
  return <Text style={{ color: colors.textMuted, padding: 12 }}>StockLy Coach is typing...</Text>;
}
