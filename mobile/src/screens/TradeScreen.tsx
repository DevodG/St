import React from 'react';
import { Alert, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '../components/common/Screen';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { OrderForm } from '../components/trade/OrderForm';
import { useSubmitOrder } from '../hooks/useOrders';
import type { RootStackParamList } from '../navigation/types';
import { api } from '../services/api';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/formatCurrency';

type Props = NativeStackScreenProps<RootStackParamList, 'Trade'>;

export function TradeScreen({ route, navigation }: Props): React.JSX.Element {
  const symbol = route.params.symbol;
  const side = route.params.side ?? 'BUY';
  const submitOrder = useSubmitOrder();
  const quote = useQuery({ queryKey: ['stock-detail', symbol], queryFn: async () => (await api.get<{ priceCents: number }>(`/market/stock/${symbol}`)).data });
  if (quote.isLoading || !quote.data) return <Screen><SkeletonLoader /></Screen>;
  return <Screen><Text style={{ color: colors.text, fontSize: 32, fontWeight: '900', padding: 16 }}>{symbol} {formatCurrency(quote.data.priceCents)}</Text><OrderForm symbol={symbol} side={side} priceCents={quote.data.priceCents} isSubmitting={submitOrder.isPending} onSubmit={(sharesFloat, orderType, limitPriceCents, timeInForce) => submitOrder.mutate({ symbol, type: side, sharesFloat, orderType, limitPriceCents, timeInForce }, { onSuccess: (result) => { const warningText = result.warnings.length > 0 ? `\n\n${result.warnings.join('\n')}` : ''; Alert.alert('Order submitted', `${result.order.status.replace(/_/g, ' ')}: ${result.fill.message}${warningText}`, [{ text: 'View orders', onPress: () => navigation.navigate('MainTabs', { screen: 'Orders' }) }]); }, onError: (error) => { Alert.alert('Order rejected', error instanceof Error ? error.message : 'Could not submit order.'); } })} /></Screen>;
}
