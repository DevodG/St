import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { CandlestickChart, CandleData } from '../components/charts/CandlestickChart';
import { PredictionOverlay } from '../components/charts/PredictionOverlay';
import { ErrorState } from '../components/common/ErrorState';
import { Screen } from '../components/common/Screen';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { MLSignalBadge } from '../components/stock/MLSignalBadge';
import { useMLPrediction } from '../hooks/useMLPrediction';
import type { RootStackParamList } from '../navigation/types';
import { api } from '../services/api';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/formatCurrency';

type Props = NativeStackScreenProps<RootStackParamList, 'StockDetail'>;

export function StockDetailScreen({ route, navigation }: Props): React.JSX.Element {
  const symbol = route.params.symbol;
  const detail = useQuery({ queryKey: ['stock-detail', symbol], queryFn: async () => (await api.get(`/market/stock/${symbol}`)).data as { name: string; priceCents: number; news: Array<{ title: string; source: string; age: string; sentiment: string }> } });
  const candles = useQuery({ queryKey: ['candles', symbol, '1M'], queryFn: async () => (await api.get<CandleData[]>(`/market/stock/${symbol}/candles`, { params: { period: '1M', interval: '1d' } })).data });
  const prediction = useMLPrediction(symbol);
  if (detail.isLoading || candles.isLoading) return <Screen><SkeletonLoader /></Screen>;
  if (detail.isError || candles.isError) return <Screen><ErrorState message="Stock detail failed to load." onRetry={() => { void detail.refetch(); void candles.refetch(); }} /></Screen>;
  return <Screen><FlatList data={detail.data?.news ?? []} keyExtractor={(item) => item.title} ListHeaderComponent={<View style={styles.wrap}><Text style={styles.title}>{detail.data?.name}</Text><Text style={styles.price}>{formatCurrency(detail.data?.priceCents ?? 0)}</Text><CandlestickChart candles={candles.data ?? []} />{prediction.data ? <View style={styles.card}><MLSignalBadge signal={prediction.data.signal} confidence={prediction.data.confidence_pct} /><Text style={styles.reason}>{prediction.data.reasoning}</Text><PredictionOverlay prices={prediction.data.predicted_prices} upper={prediction.data.band_upper} lower={prediction.data.band_lower} /></View> : <SkeletonLoader />}<View style={styles.actions}><Pressable style={[styles.action, { backgroundColor: colors.success }]} onPress={() => navigation.navigate('Trade', { symbol, side: 'BUY' })}><Text style={styles.actionText}>Buy</Text></Pressable><Pressable style={[styles.action, { backgroundColor: colors.danger }]} onPress={() => navigation.navigate('Trade', { symbol, side: 'SELL' })}><Text style={styles.actionText}>Sell</Text></Pressable></View><Text style={styles.section}>News</Text></View>} renderItem={({ item }) => <View style={styles.news}><Text style={styles.newsTitle}>{item.title}</Text><Text style={styles.reason}>{item.source} / {item.age} / {item.sentiment}</Text></View>} /></Screen>;
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 12 },
  title: { color: colors.text, fontSize: 26, fontWeight: '900' },
  price: { color: colors.text, fontSize: 34, fontWeight: '900', fontVariant: ['tabular-nums'] },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, gap: 10 },
  reason: { color: colors.textMuted, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 12 },
  action: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
  actionText: { color: colors.text, fontWeight: '900' },
  section: { color: colors.text, fontSize: 20, fontWeight: '800' },
  news: { marginHorizontal: 16, marginVertical: 6, padding: 14, borderRadius: 16, backgroundColor: colors.surface },
  newsTitle: { color: colors.text, fontWeight: '700' },
});
