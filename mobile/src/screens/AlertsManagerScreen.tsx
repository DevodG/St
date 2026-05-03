import React from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View, Alert as RNAlert } from 'react-native';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Screen } from '../components/common/Screen';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { useAlerts, useDeleteAlert, useDismissAlert } from '../hooks/useAlerts';
import { colors } from '../theme/colors';
import { timeAgo } from '../utils/dateHelpers';
import { formatCurrency } from '../utils/formatCurrency';

export function AlertsManagerScreen(): React.JSX.Element {
  const alerts = useAlerts();
  const dismiss = useDismissAlert();
  const remove = useDeleteAlert();

  const handleDismiss = (id: string) => {
    dismiss.mutate(id);
  };

  const handleDelete = (id: string) => {
    RNAlert.alert('Delete Alert?', 'This alert will be permanently removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove.mutate(id) },
    ]);
  };

  if (alerts.isLoading) return <Screen><SkeletonLoader /></Screen>;
  if (alerts.isError) return <Screen><ErrorState message="Could not load alerts." onRetry={() => alerts.refetch()} /></Screen>;

  return (
    <Screen>
      <FlatList
        data={alerts.data ?? []}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={alerts.isFetching} onRefresh={() => { void alerts.refetch(); }} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Price Alerts</Text>
            <Text style={styles.subtitle}>Stay on top of market volatility by managing your custom price triggers.</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState title="No alerts set" body="Add alerts from any stock page to get notified when prices move." />}
        renderItem={({ item }) => (
          <View style={[styles.card, item.status === 'TRIGGERED' && styles.triggeredCard]}>
            <View style={styles.topRow}>
              <View>
                <Text style={styles.symbol}>{item.symbol}</Text>
                <Text style={styles.condition}>
                  {item.condition === 'above' ? 'Price crosses above' : 'Price crosses below'} {formatCurrency(item.targetPriceCents)}
                </Text>
              </View>
              <View style={[styles.statusPill, { borderColor: item.status === 'TRIGGERED' ? colors.warning : item.status === 'ACTIVE' ? colors.primary : colors.textMuted }]}>
                <Text style={[styles.statusText, { color: item.status === 'TRIGGERED' ? colors.warning : item.status === 'ACTIVE' ? colors.primary : colors.textMuted }]}>{item.status}</Text>
              </View>
            </View>

            {item.status === 'TRIGGERED' ? (
              <View style={styles.triggerInfo}>
                <Text style={styles.triggerText}>Triggered {timeAgo(item.triggeredAt ?? '')}</Text>
                <Pressable style={styles.dismissButton} onPress={() => handleDismiss(item.id)}>
                  <Text style={styles.dismissText}>Dismiss</Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.footer}>
              <Text style={styles.timestamp}>Created {timeAgo(item.createdAt)}</Text>
              <Pressable onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
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
  card: { marginHorizontal: 16, marginVertical: 8, padding: 16, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 12 },
  triggeredCard: { borderColor: colors.warning, borderLeftWidth: 4, borderLeftColor: colors.warning },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  symbol: { color: colors.text, fontSize: 18, fontWeight: '900' },
  condition: { color: colors.textMuted, marginTop: 4 },
  statusPill: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '900' },
  triggerInfo: { backgroundColor: colors.surface2, padding: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  triggerText: { color: colors.text, fontWeight: '700', fontSize: 12 },
  dismissButton: { backgroundColor: colors.warning, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  dismissText: { color: colors.bg, fontWeight: '800', fontSize: 11 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  timestamp: { color: colors.textHint, fontSize: 11 },
  deleteText: { color: colors.danger, fontWeight: '800', fontSize: 12 },
});
