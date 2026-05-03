import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: Props): React.JSX.Element {
  return <View style={styles.wrap}><Text style={styles.title}>Something went wrong</Text><Text style={styles.message}>{message}</Text>{onRetry ? <Pressable style={styles.button} onPress={onRetry}><Text style={styles.buttonText}>Retry</Text></Pressable> : null}</View>;
}

const styles = StyleSheet.create({
  wrap: { padding: 24, gap: 12, alignItems: 'center' },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  message: { color: colors.textMuted, textAlign: 'center' },
  button: { backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  buttonText: { color: colors.text, fontWeight: '700' },
});
