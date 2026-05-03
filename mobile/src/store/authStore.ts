import { create } from 'zustand';
import { api } from '../services/api';
import { getJson, setJson, storage, storageKeys } from '../services/storage';

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string | null;
  riskLevel?: 'conservative' | 'balanced' | 'aggressive';
  isOnboarded?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  bootstrapped: boolean;
  bootstrap: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  bootstrapped: false,
  bootstrap: () => {
    set({
      user: getJson<User>(storageKeys.user),
      accessToken: storage.getString(storageKeys.accessToken) ?? null,
      refreshToken: storage.getString(storageKeys.refreshToken) ?? null,
      bootstrapped: true,
    });
  },
  login: async (email, password) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    storage.set(storageKeys.accessToken, data.accessToken);
    storage.set(storageKeys.refreshToken, data.refreshToken);
    setJson(storageKeys.user, data.user);
    set({ ...data });
  },
  register: async (email, username, password) => {
    const { data } = await api.post<AuthResponse>('/auth/register', { email, username, password });
    storage.set(storageKeys.accessToken, data.accessToken);
    storage.set(storageKeys.refreshToken, data.refreshToken);
    setJson(storageKeys.user, data.user);
    set({ ...data });
  },
  refreshAccessToken: async () => {
    const refreshToken = get().refreshToken;
    if (!refreshToken) return;
    const { data } = await api.post<{ accessToken: string }>('/auth/refresh', { refreshToken });
    storage.set(storageKeys.accessToken, data.accessToken);
    set({ accessToken: data.accessToken });
  },
  logout: async () => {
    const refreshToken = get().refreshToken;
    if (refreshToken) await api.post('/auth/logout', { refreshToken }).catch(() => undefined);
    storage.delete(storageKeys.accessToken);
    storage.delete(storageKeys.refreshToken);
    storage.delete(storageKeys.user);
    set({ user: null, accessToken: null, refreshToken: null });
  },
  setUser: (user) => {
    setJson(storageKeys.user, user);
    set({ user });
  },
}));
