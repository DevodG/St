import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/common/Screen';
import { useAuthStore } from '../store/authStore';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

const badges = ['first_trade', 'diversified', 'ten_pct_gain', 'loss_lesson', 'week_streak', 'big_winner', 'hundred_trades', 'watchlist_pro', 'chat_learner', 'leaderboard_top'];
const glossary = ['Diversification: spreading investments across multiple assets.', 'P/E ratio: price divided by earnings per share.', 'Volume: how many shares changed hands.', 'ETF: a fund that trades like a stock.', 'Market cap: company value based on share price times shares.'];

export function ProfileScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  
  return (
    <Screen>
      <FlatList 
        data={glossary} 
        keyExtractor={(item) => item} 
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.username?.slice(0, 2).toUpperCase() ?? 'SL'}</Text>
            </View>
            <Text style={styles.name}>{user?.username}</Text>
            <Text style={styles.muted}>Risk level: {user?.riskLevel ?? 'balanced'}</Text>
            
            <Pressable style={styles.alertBtn} onPress={() => navigation.navigate('AlertsManager')}>
              <Text style={styles.alertBtnText}>Manage Price Alerts</Text>
            </Pressable>

            <Text style={styles.section}>Achievements</Text>
            <View style={styles.badges}>
              {badges.map((badge) => <Text key={badge} style={styles.badge}>{badge}</Text>)}
            </View>
            
            <Pressable style={styles.danger} onPress={() => Alert.alert('Reset Portfolio', 'Double confirmation required in production builds.')}>
              <Text style={styles.dangerText}>Reset Portfolio</Text>
            </Pressable>
            
            <Pressable style={styles.logout} onPress={() => void logout()}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
            
            <Text style={styles.section}>Glossary</Text>
          </View>
        } 
        renderItem={({ item }) => <Text style={styles.term}>{item}</Text>} 
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, alignItems: 'center', gap: 12 },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.text, fontSize: 28, fontWeight: '900' },
  name: { color: colors.text, fontSize: 24, fontWeight: '900' },
  muted: { color: colors.textMuted },
  alertBtn: { width: '100%', backgroundColor: colors.surface2, padding: 14, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  alertBtnText: { color: colors.primary, fontWeight: '800' },
  section: { alignSelf: 'flex-start', color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 12 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { color: colors.text, backgroundColor: colors.surface2, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, overflow: 'hidden' },
  danger: { width: '100%', backgroundColor: `${colors.danger}22`, padding: 14, borderRadius: 14, alignItems: 'center' },
  dangerText: { color: colors.danger, fontWeight: '800' },
  logout: { width: '100%', backgroundColor: colors.surface2, padding: 14, borderRadius: 14, alignItems: 'center' },
  logoutText: { color: colors.text, fontWeight: '800' },
  term: { color: colors.textMuted, paddingHorizontal: 16, paddingVertical: 10, lineHeight: 20 },
});
