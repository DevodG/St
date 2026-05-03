import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({ id: 'stockly-storage' });

export const storageKeys = {
  accessToken: 'auth.accessToken',
  refreshToken: 'auth.refreshToken',
  user: 'auth.user',
  onboardingComplete: 'onboarding.complete',
  watchlist: 'watchlist.symbols',
} as const;

export function getJson<T>(key: string): T | null {
  const raw = storage.getString(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

export function setJson<T>(key: string, value: T): void {
  storage.set(key, JSON.stringify(value));
}
