import React, { useState } from 'react';
import { FlatList, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { ErrorState } from '../components/common/ErrorState';
import { Screen } from '../components/common/Screen';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { StockCard, StockCardData } from '../components/stock/StockCard';
import type { RootStackParamList } from '../navigation/types';
import { api } from '../services/api';
import { useWatchlistStore } from '../store/watchlistStore';
import { colors } from '../theme/colors';

export function MarketScreen(): React.JSX.Element {
  const [query, setQuery] = useState('a');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const add = useWatchlistStore((state) => state.add);
  const stocks = useQuery({ queryKey: ['market-search', query], queryFn: async () => (await api.get<StockCardData[]>('/market/search', { params: { q: query || 'a', limit: 20 } })).data, staleTime: 30_000 });
  if (stocks.isLoading) return <Screen><TextInput style={styles.search} value={query} onChangeText={setQuery} placeholder="Search stocks" placeholderTextColor={colors.textHint} /><SkeletonLoader /></Screen>;
  if (stocks.isError) return <Screen><ErrorState message="Market search failed." onRetry={() => stocks.refetch()} /></Screen>;
  return <Screen><FlatList data={stocks.data ?? []} keyExtractor={(item) => item.symbol} ListHeaderComponent={<TextInput style={styles.search} value={query} onChangeText={setQuery} placeholder="Search stocks" placeholderTextColor={colors.textHint} />} renderItem={({ item }) => <StockCard stock={item} onPress={() => navigation.navigate('StockDetail', { symbol: item.symbol })} onToggleWatch={() => add(item.symbol)} />} /></Screen>;
}

const styles = StyleSheet.create({ search: { margin: 16, padding: 14, borderRadius: 16, backgroundColor: colors.surface2, color: colors.text } });
