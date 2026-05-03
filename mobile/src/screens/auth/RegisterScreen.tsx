import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { Screen } from '../../components/common/Screen';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';

export function RegisterScreen(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const register = useAuthStore((state) => state.register);
  return <Screen><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrap}><Text style={styles.title}>Create your StockLy account</Text><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" placeholderTextColor={colors.textHint} style={styles.input} /><TextInput value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="Username" placeholderTextColor={colors.textHint} style={styles.input} /><TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" placeholderTextColor={colors.textHint} style={styles.input} />{error ? <Text style={styles.error}>{error}</Text> : null}<Pressable style={styles.button} onPress={() => register(email, username, password).catch((err: unknown) => setError(err instanceof Error ? err.message : 'Registration failed'))}><Text style={styles.buttonText}>Start with $100,000</Text></Pressable></KeyboardAvoidingView></Screen>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', padding: 24, gap: 14 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: 12 },
  input: { backgroundColor: colors.surface2, color: colors.text, padding: 16, borderRadius: 16 },
  button: { backgroundColor: colors.primary, padding: 16, borderRadius: 16, alignItems: 'center' },
  buttonText: { color: colors.text, fontWeight: '800' },
  error: { color: colors.danger },
});
