import React, { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ChatBubble } from '../components/chat/ChatBubble';
import { StreamingBubble } from '../components/chat/StreamingBubble';
import { SuggestedQuestions } from '../components/chat/SuggestedQuestions';
import { Screen } from '../components/common/Screen';
import { useChatStream } from '../hooks/useChatStream';
import { colors } from '../theme/colors';

export function ChatScreen(): React.JSX.Element {
  const [input, setInput] = useState('');
  const sessionId = useMemo(() => '00000000-0000-4000-8000-000000000001', []);
  const { messages, streaming, sendMessage } = useChatStream();
  const send = (content: string) => { setInput(''); void sendMessage(content, sessionId); };
  return <Screen><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrap}><FlatList data={messages} keyExtractor={(_item, index) => `${index}`} ListEmptyComponent={<SuggestedQuestions onSelect={send} />} renderItem={({ item }) => <ChatBubble role={item.role} content={item.content} />} ListFooterComponent={streaming ? <StreamingBubble /> : null} contentContainerStyle={styles.list} /><View style={styles.composer}><TextInput value={input} onChangeText={setInput} placeholder="Ask StockLy Coach" placeholderTextColor={colors.textHint} style={styles.input} /><Pressable style={styles.send} onPress={() => send(input)}><Text style={styles.sendText}>Send</Text></Pressable></View></KeyboardAvoidingView></Screen>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  list: { padding: 16 },
  composer: { flexDirection: 'row', gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, backgroundColor: colors.surface2, color: colors.text, borderRadius: 16, padding: 14 },
  send: { backgroundColor: colors.primary, borderRadius: 16, justifyContent: 'center', paddingHorizontal: 18 },
  sendText: { color: colors.text, fontWeight: '800' },
});
