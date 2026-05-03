import React, { useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Screen } from '../components/common/Screen';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { useCancelOrder, useOrderEvents, useOrders } from '../hooks/useOrders';
import type { Order, OrderStatus } from '../services/orders';
import { colors } from '../theme/colors';
import { timeAgo } from '../utils/dateHelpers';
import { formatCurrency, formatShares } from '../utils/formatCurrency';

const filters: Array<OrderStatus | 'ALL'> = ['ALL', 'ACCEPTED', 'PARTIALLY_FILLED', 'FILLED', 'REJECTED', 'CANCELLED'];
const openStatuses: OrderStatus[] = ['NEW', 'ACCEPTED', 'PARTIALLY_FILLED'];

function statusColor(status: OrderStatus): string {
  if (status === 'FILLED') return colors.success;
  if (status === 'REJECTED' || status === 'EXPIRED' || status === 'CANCELLED') return colors.danger;
  if (status === 'PARTIALLY_FILLED') return colors.warning;
  return colors.primary;
}

function statusLabel(status: OrderStatus): string {
  return status.replace(/_/g, ' ');
}

function formatDate(date: string | null): string {
  return date ? timeAgo(date) : 'pending';
}

interface OrderRowProps {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  onCancel: () => void;
  cancelPending: boolean;
}

function OrderRow({ order, expanded, onToggle, onCancel, cancelPending }: OrderRowProps): React.JSX.Element {
  const events = useOrderEvents(expanded ? order.id : null);
  const canCancel = openStatuses.includes(order.status);
  const notionalCents = order.avgFillPriceCents !== null ? Math.round((order.filledSharesTimes1000 * order.avgFillPriceCents) / 1000) : order.requestedNotionalCents;

  return (
    <Pressable style={styles.orderCard} onPress={onToggle}>
      <View style={styles.orderTopRow}>
        <View>
          <Text style={styles.symbol}>{order.side} {order.symbol}</Text>
          <Text style={styles.meta}>{formatShares(order.sharesTimes1000)} shares / {order.orderType.toUpperCase()} / {order.timeInForce}</Text>
        </View>
        <View style={[styles.statusPill, { borderColor: statusColor(order.status) }]}>
          <Text style={[styles.statusText, { color: statusColor(order.status) }]}>{statusLabel(order.status)}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View>
          <Text style={styles.metricLabel}>Filled</Text>
          <Text style={styles.metricValue}>{formatShares(order.filledSharesTimes1000)}</Text>
        </View>
        <View>
          <Text style={styles.metricLabel}>Avg price</Text>
          <Text style={styles.metricValue}>{order.avgFillPriceCents !== null ? formatCurrency(order.avgFillPriceCents) : '--'}</Text>
        </View>
        <View>
          <Text style={styles.metricLabel}>Notional</Text>
          <Text style={styles.metricValue}>{notionalCents !== null ? formatCurrency(notionalCents) : '--'}</Text>
        </View>
      </View>

      {order.rejectionReason ? <Text style={styles.warningText}>{order.rejectionReason}</Text> : null}
      <Text style={styles.timestamp}>Submitted {formatDate(order.submittedAt)}</Text>

      {canCancel ? <Pressable style={styles.cancelButton} onPress={onCancel} disabled={cancelPending}><Text style={styles.cancelText}>{cancelPending ? 'Cancelling...' : 'Cancel order'}</Text></Pressable> : null}

      {expanded ? <View style={styles.eventsBox}>{events.isLoading ? <SkeletonLoader /> : (events.data ?? []).map((event) => <View key={event.id} style={styles.eventRow}><View style={styles.eventDot} /><View style={styles.eventBody}><Text style={styles.eventTitle}>{statusLabel(event.status)} / {event.eventType}</Text><Text style={styles.eventMessage}>{event.message}</Text><Text style={styles.timestamp}>{formatDate(event.createdAt)}</Text></View></View>)}</View> : null}
    </Pressable>
  );
}

export function OrdersScreen(): React.JSX.Element {
  const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const orders = useOrders(status === 'ALL' ? undefined : status);
  const cancel = useCancelOrder();

  function confirmCancel(orderId: string): void {
    Alert.alert('Cancel order?', 'Open paper orders can be cancelled before they are fully filled.', [
      { text: 'Keep order', style: 'cancel' },
      { text: 'Cancel order', style: 'destructive', onPress: () => cancel.mutate(orderId) },
    ]);
  }

  if (orders.isLoading) return <Screen><SkeletonLoader /></Screen>;
  if (orders.isError) return <Screen><ErrorState message="Could not load orders." onRetry={() => orders.refetch()} /></Screen>;

  return (
    <Screen>
      <FlatList
        data={orders.data ?? []}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={orders.isFetching} onRefresh={() => { void orders.refetch(); }} tintColor={colors.primary} />}
        ListHeaderComponent={<View style={styles.header}><Text style={styles.title}>Order Blotter</Text><Text style={styles.subtitle}>Track intent, fills, rejections, cancellations, and the audit trail behind every paper order.</Text><FlatList horizontal data={filters} keyExtractor={(item) => item} showsHorizontalScrollIndicator={false} renderItem={({ item }) => <Pressable style={[styles.filterChip, status === item && styles.activeFilter]} onPress={() => setStatus(item)}><Text style={[styles.filterText, status === item && styles.activeFilterText]}>{statusLabel(item as OrderStatus)}</Text></Pressable>} /></View>}
        ListEmptyComponent={<EmptyState title="No orders yet" body="Place a buy or sell order from any stock detail page." />}
        renderItem={({ item }) => <OrderRow order={item} expanded={expandedOrderId === item.id} onToggle={() => setExpandedOrderId(expandedOrderId === item.id ? null : item.id)} onCancel={() => confirmCancel(item.id)} cancelPending={cancel.isPending && cancel.variables === item.id} />}
        contentContainerStyle={styles.listContent}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 24 },
  header: { padding: 16, gap: 12 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900' },
  subtitle: { color: colors.textMuted, lineHeight: 20 },
  filterChip: { marginRight: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  activeFilter: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.textMuted, fontWeight: '800', fontSize: 12 },
  activeFilterText: { color: colors.text },
  orderCard: { marginHorizontal: 16, marginVertical: 7, padding: 16, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 12 },
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  symbol: { color: colors.text, fontSize: 18, fontWeight: '900' },
  meta: { color: colors.textMuted, marginTop: 4 },
  statusPill: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { fontSize: 11, fontWeight: '900' },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  metricLabel: { color: colors.textMuted, fontSize: 12 },
  metricValue: { color: colors.text, fontWeight: '800', fontVariant: ['tabular-nums'] },
  warningText: { color: colors.warning, fontWeight: '700' },
  timestamp: { color: colors.textHint, fontSize: 12 },
  cancelButton: { alignSelf: 'flex-start', backgroundColor: colors.surface2, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  cancelText: { color: colors.danger, fontWeight: '800' },
  eventsBox: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, gap: 10 },
  eventRow: { flexDirection: 'row', gap: 10 },
  eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 },
  eventBody: { flex: 1, gap: 3 },
  eventTitle: { color: colors.text, fontWeight: '800' },
  eventMessage: { color: colors.textMuted, lineHeight: 19 },
});
