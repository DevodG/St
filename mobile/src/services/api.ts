import axios from 'axios';
import { Platform } from 'react-native';
import { storage, storageKeys } from './storage';

export const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = storage.getString(storageKeys.accessToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && storage.getString(storageKeys.refreshToken)) {
      originalRequest._retry = true;
      try {
        const refreshToken = storage.getString(storageKeys.refreshToken);
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        storage.set(storageKeys.accessToken, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        storage.delete(storageKeys.accessToken);
        storage.delete(storageKeys.refreshToken);
        storage.delete(storageKeys.user);
        // You might want to trigger a logout in the store here as well
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
