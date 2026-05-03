import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';
import { configureNotifications } from './src/services/notifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 3, staleTime: 30_000 },
    mutations: { retry: 0 },
  },
});

export default function App(): React.JSX.Element {
  useEffect(() => {
    configureNotifications();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
