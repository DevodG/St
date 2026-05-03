import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '../components/common/Screen';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { api } from '../services/api';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/formatCurrency';
import { formatBps } from '../utils/formatPercent';

interface RankRow { rank: number; username: string; returnBps: number; portfolioCents: number }

export function LeaderboardScreen(): React.JSX.Element {
  const board = useQuery({ queryKey: ['leaderboard', 'weekly'], queryFn: async () => (await api.get<RankRow[]>('/leaderboard', { params: { period: 'weekly' } })).data, refetchInterval: 300_000 });
  if (board.isLoading) return <Screen><SkeletonLoader /></Screen>;
  return <Screen><FlatList data={board.data ?? []} keyExtractor={(item) => `${item.rank}-${item.username}`} ListHeaderComponent={<Text style={styles.title}>Weekly leaderboard</Text>} renderItem={({ item }) => <View style={styles.row}><Text style={styles.rank}>#{item.rank}</Text><Text style={styles.name}>{item.username}</Text><Text style={styles.value}>{formatBps(item.returnBps)} / {formatCurrency(item.portfolioCents)}</Text></View>} /></Screen>;
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 28, fontWeight: '900', padding: 16 },
  row: { marginHorizontal: 16, marginVertical: 6, padding: 16, borderRadius: 16, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rank: { color: colors.warning, fontWeight: '900', width: 44 },
  name: { color: colors.text, fontWeight: '800', flex: 1 },
  value: { color: colors.textMuted, fontVariant: ['tabular-nums'] },
});
