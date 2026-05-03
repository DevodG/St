import React from 'react';
import { SafeAreaView, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Screen({ children, style }: Props): React.JSX.Element {
  return <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
});
