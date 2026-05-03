import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Register: undefined;
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  StockDetail: { symbol: string };
  Trade: { symbol: string; side?: 'BUY' | 'SELL' };
  Journal: undefined;
  JournalEdit: { tradeId: string };
  AlertsManager: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Market: undefined;
  Portfolio: undefined;
  Orders: undefined;
  Chat: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};
