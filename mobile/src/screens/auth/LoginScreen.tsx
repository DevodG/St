import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/common/Screen';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export function LoginScreen({ navigation }: Props): React.JSX.Element {
  const [email, setEmail] = useState('demo@stockly.local');
  const [password, setPassword] = useState('StockLyDemo123!');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  return <Screen><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrap}><Text style={styles.hero}>Trade with virtual money. Learn with real feedback.</Text><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" placeholderTextColor={colors.textHint} style={styles.input} /><TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" placeholderTextColor={colors.textHint} style={styles.input} />{error ? <Text style={styles.error}>{error}</Text> : null}<Pressable style={styles.button} onPress={() => login(email, password).catch((err: unknown) => setError(err instanceof Error ? err.message : 'Login failed'))}><Text style={styles.buttonText}>Log in</Text></Pressable><Pressable onPress={() => navigation.navigate('Register')}><Text style={styles.link}>Create an account</Text></Pressable></KeyboardAvoidingView></Screen>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', padding: 24, gap: 14 },
  hero: { color: colors.text, fontSize: 30, fontWeight: '800', lineHeight: 36, marginBottom: 16 },
  input: { backgroundColor: colors.surface2, color: colors.text, padding: 16, borderRadius: 16 },
  button: { backgroundColor: colors.primary, padding: 16, borderRadius: 16, alignItems: 'center' },
  buttonText: { color: colors.text, fontWeight: '800' },
  link: { color: colors.primary, textAlign: 'center', fontWeight: '700' },
  error: { color: colors.danger },
});
