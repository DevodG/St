import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { PortfolioLineChart } from '../components/charts/PortfolioLineChart';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Screen } from '../components/common/Screen';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { PerformanceCard } from '../components/portfolio/PerformanceCard';
import { usePortfolio } from '../hooks/usePortfolio';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/formatCurrency';
import { formatBps } from '../utils/formatPercent';

const tips = ['Diversification means not putting all your practice money in one stock.', 'A P/E ratio compares price to company earnings.', 'Volume shows how many shares traded during a period.', 'Dollar cost averaging means investing a set amount on a regular schedule.'];

export function DashboardScreen(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const portfolio = usePortfolio();
  const history = useQuery({ queryKey: ['portfolio-history', '1M'], queryFn: async () => (await api.get<Array<{ date: string; valueCents: number }>>('/portfolio/history', { params: { range: '1M' } })).data });
  const tip = tips[new Date().getDate() % tips.length];
  if (portfolio.isLoading) return <Screen><SkeletonLoader /></Screen>;
  if (portfolio.isError) return <Screen><ErrorState message="Could not load your dashboard." onRetry={() => portfolio.refetch()} /></Screen>;
  if (!portfolio.data) return <Screen><EmptyState title="No portfolio yet" body="Create an account to start with virtual cash." /></Screen>;
  return <Screen><FlatList data={portfolio.data.holdings.slice(0, 3)} keyExtractor={(item) => item.symbol} refreshControl={<RefreshControl refreshing={portfolio.isFetching || history.isFetching} onRefresh={() => { void portfolio.refetch(); void history.refetch(); }} tintColor={colors.primary} />} ListHeaderComponent={<View style={styles.header}><Text style={styles.hello}>Hi {user?.username ?? 'investor'}</Text><Text style={styles.value}>{formatCurrency(portfolio.data.totalValueCents)}</Text><Text style={[styles.returnText, { color: portfolio.data.returnBps >= 0 ? colors.success : colors.danger }]}>{formatBps(portfolio.data.returnBps)}</Text>{history.data ? <PortfolioLineChart values={history.data} /> : <SkeletonLoader />}<View style={styles.cards}><PerformanceCard label="Cash" value={formatCurrency(portfolio.data.portfolio.cashCents)} /><PerformanceCard label="Invested" value={formatCurrency(portfolio.data.investedCents)} /></View><Text style={styles.section}>Top Holdings</Text></View>} renderItem={({ item }) => <View style={styles.holding}><Text style={styles.symbol}>{item.symbol}</Text><Text style={styles.muted}>{formatCurrency(item.marketValueCents)} / {formatBps(item.unrealizedPnlBps)}</Text></View>} ListFooterComponent={<View style={styles.tip}><Text style={styles.section}>Daily Tip</Text><Text style={styles.muted}>{tip}</Text></View>} /></Screen>;
}

const styles = StyleSheet.create({
  header: { padding: 16, gap: 10 },
  hello: { color: colors.textMuted },
  value: { color: colors.text, fontSize: 38, fontWeight: '900', fontVariant: ['tabular-nums'] },
  returnText: { fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  cards: { flexDirection: 'row', gap: 12 },
  section: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 14 },
  holding: { marginHorizontal: 16, marginVertical: 6, padding: 16, backgroundColor: colors.surface, borderRadius: 16 },
  symbol: { color: colors.text, fontSize: 18, fontWeight: '800' },
  muted: { color: colors.textMuted, fontVariant: ['tabular-nums'] },
  tip: { padding: 16, gap: 8 },
});
