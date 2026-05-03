import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { StockDetailScreen } from '../screens/StockDetailScreen';
import { TradeScreen } from '../screens/TradeScreen';
import { JournalScreen } from '../screens/JournalScreen';
import { JournalEditScreen } from '../screens/JournalEditScreen';
import { AlertsManagerScreen } from '../screens/AlertsManagerScreen';
import { useAuthStore } from '../store/authStore';
import { storage, storageKeys } from '../services/storage';
import { colors } from '../theme/colors';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AuthStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="Auth" component={LoginScreen} options={{ title: 'StockLy' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
    </Stack.Navigator>
  );
}

export function RootNavigator(): React.JSX.Element {
  const { user, bootstrapped, bootstrap } = useAuthStore();
  const [onboarded, setOnboarded] = useState(storage.getBoolean(storageKeys.onboardingComplete) ?? false);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (!bootstrapped) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}><ActivityIndicator color={colors.primary} /></View>;
  }

  if (!onboarded) {
    return <OnboardingScreen onComplete={() => { storage.set(storageKeys.onboardingComplete, true); setOnboarded(true); }} />;
  }

  if (!user) {
    return <AuthStack />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="StockDetail" component={StockDetailScreen} options={({ route }) => ({ title: route.params.symbol })} />
      <Stack.Screen name="Trade" component={TradeScreen} options={({ route }) => ({ title: `${route.params.side ?? 'Trade'} ${route.params.symbol}` })} />
      <Stack.Screen name="Journal" component={JournalScreen} options={{ title: 'Trade Journal' }} />
      <Stack.Screen name="JournalEdit" component={JournalEditScreen} options={{ title: 'Journal Entry' }} />
      <Stack.Screen name="AlertsManager" component={AlertsManagerScreen} options={{ title: 'Price Alerts' }} />
    </Stack.Navigator>
  );
}
