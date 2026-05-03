import React from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Screen } from '../components/common/Screen';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { useJournals } from '../hooks/useJournals';
import { colors } from '../theme/colors';
import { timeAgo } from '../utils/dateHelpers';
import { formatCurrency, formatShares } from '../utils/formatCurrency';

export function JournalScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const journals = useJournals();

  if (journals.isLoading) return <Screen><SkeletonLoader /></Screen>;
  if (journals.isError) return <Screen><ErrorState message="Could not load journal." onRetry={() => journals.refetch()} /></Screen>;

  const data = journals.data?.journals ?? [];

  return (
    <Screen>
      <FlatList
        data={data}
        keyExtractor={(item) => item.journal.id}
        refreshControl={<RefreshControl refreshing={journals.isFetching} onRefresh={() => { void journals.refetch(); }} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Trade Journal</Text>
            <Text style={styles.subtitle}>Document your thesis, track your mood, and identify your mistakes to become a better investor.</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState title="No entries yet" body="Place some trades then document your reasoning here." />}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate('JournalEdit', { tradeId: item.trade.id })}>
            <View style={styles.topRow}>
              <View>
                <Text style={styles.symbol}>{item.trade.symbol}</Text>
                <Text style={styles.meta}>{item.trade.tradeType} {formatShares(item.trade.sharesTimes1000)} shares @ {formatCurrency(item.trade.priceCents)}</Text>
              </View>
              {item.journal.confidence ? (
                <View style={styles.confidencePill}>
                  <Text style={styles.confidenceText}>Confidence: {item.journal.confidence}/5</Text>
                </View>
              ) : null}
            </View>
            
            {item.journal.thesis ? (
              <Text style={styles.thesisPreview} numberOfLines={2}>{item.journal.thesis}</Text>
            ) : (
              <Text style={styles.prompt}>Tap to add thesis and tags...</Text>
            )}

            <View style={styles.footer}>
              <View style={styles.tags}>
                {item.journal.tags.map((tag, idx) => (
                  <View key={idx} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
                ))}
              </View>
              <Text style={styles.timestamp}>{timeAgo(item.trade.executedAt)}</Text>
            </View>
          </Pressable>
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
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  symbol: { color: colors.text, fontSize: 18, fontWeight: '900' },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  confidencePill: { backgroundColor: colors.surface2, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  confidenceText: { color: colors.primary, fontSize: 11, fontWeight: '800' },
  thesisPreview: { color: colors.text, lineHeight: 20 },
  prompt: { color: colors.textHint, fontStyle: 'italic' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 },
  tag: { backgroundColor: colors.surface2, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { color: colors.textMuted, fontSize: 10, fontWeight: '700' },
  timestamp: { color: colors.textHint, fontSize: 11 },
});
