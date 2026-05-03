import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

const questions = ['Why is my portfolio down today?', 'Explain what a P/E ratio means', 'Should I diversify more?', "What is AAPL's outlook?", 'What is dollar cost averaging?'];

export function SuggestedQuestions({ onSelect }: { onSelect: (question: string) => void }): React.JSX.Element {
  return <View style={styles.wrap}>{questions.map((question) => <Pressable key={question} style={styles.chip} onPress={() => onSelect(question)}><Text style={styles.text}>{question}</Text></Pressable>)}</View>;
}

const styles = StyleSheet.create({
  wrap: { gap: 8, padding: 16 },
  chip: { padding: 12, borderRadius: 14, backgroundColor: colors.surface2 },
  text: { color: colors.text },
});
