import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { colors } from '../../theme/colors';

export function ChatBubble({ role, content }: { role: 'user' | 'assistant'; content: string }): React.JSX.Element {
  const isUser = role === 'user';
  return <View style={[styles.bubble, isUser ? styles.user : styles.assistant]}>{isUser ? <Text style={styles.userText}>{content}</Text> : <Markdown style={{ body: styles.assistantText }}>{content}</Markdown>}</View>;
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '84%', padding: 12, borderRadius: 18, marginVertical: 6 },
  user: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  assistant: { alignSelf: 'flex-start', backgroundColor: colors.surface2 },
  userText: { color: colors.text },
  assistantText: { color: colors.text },
});
