import React from 'react';
import { Pressable, FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { EmptyState } from '../components/common/EmptyState';
import { Screen } from '../components/common/Screen';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { HoldingRow } from '../components/portfolio/HoldingRow';
import { PerformanceCard } from '../components/portfolio/PerformanceCard';
import { usePortfolio } from '../hooks/usePortfolio';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/formatCurrency';
import { formatBps } from '../utils/formatPercent';

export function PortfolioScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const portfolio = usePortfolio();
  if (portfolio.isLoading) return <Screen><SkeletonLoader /></Screen>;
  
  return (
    <Screen>
      <FlatList 
        data={portfolio.data?.holdings ?? []} 
        keyExtractor={(item) => item.id} 
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Portfolio</Text>
              <Pressable style={styles.journalBtn} onPress={() => navigation.navigate('Journal')}>
                <Text style={styles.journalBtnText}>Journal</Text>
              </Pressable>
            </View>
            <Text style={styles.value}>{portfolio.data ? formatCurrency(portfolio.data.totalValueCents) : '--'}</Text>
            <View style={styles.cards}>
              <PerformanceCard label="Cash" value={portfolio.data ? formatCurrency(portfolio.data.portfolio.cashCents) : '--'} />
              <PerformanceCard label="Return" value={portfolio.data ? formatBps(portfolio.data.returnBps) : '--'} />
            </View>
          </View>
        } 
        renderItem={({ item }) => <HoldingRow holding={item} />} 
        ListEmptyComponent={<EmptyState title="No holdings" body="Buy your first stock from the Market tab." />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, gap: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: colors.text, fontSize: 28, fontWeight: '900' },
  journalBtn: { backgroundColor: colors.surface2, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  journalBtnText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  value: { color: colors.text, fontSize: 36, fontWeight: '900', fontVariant: ['tabular-nums'] },
  cards: { flexDirection: 'row', gap: 12 },
});
