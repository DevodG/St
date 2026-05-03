import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Screen } from '../components/common/Screen';
import { ErrorState } from '../components/common/ErrorState';
import { useJournal, useUpdateJournal } from '../hooks/useJournals';
import { colors } from '../theme/colors';
import { formatCurrency, formatShares } from '../utils/formatCurrency';

const confidenceLevels = [1, 2, 3, 4, 5];
const moods = ['Confident', 'Anxious', 'Greedy', 'Fearful', 'Bored', 'Excited'];
const mistakes = ['None', 'FOMO', 'Over-trading', 'Averaging Down', 'Ignoring Stop Loss', 'Revenue Miss'];

export function JournalEditScreen(): React.JSX.Element {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const tradeId = route.params.tradeId;
  const journalQuery = useJournal(tradeId);
  const updateMutation = useUpdateJournal();

  const [thesis, setThesis] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [mood, setMood] = useState('');
  const [lesson, setLesson] = useState('');
  const [mistake, setMistake] = useState('');

  useEffect(() => {
    if (journalQuery.data?.journal) {
      const j = journalQuery.data.journal;
      setThesis(j.thesis ?? '');
      setConfidence(j.confidence);
      setMood(j.mood ?? '');
      setLesson(j.lesson ?? '');
      setMistake(j.mistakeCategory ?? '');
    }
  }, [journalQuery.data]);

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      tradeId,
      input: { thesis, confidence: confidence ?? undefined, mood, lesson, mistakeCategory: mistake }
    });
    navigation.goBack();
  };

  if (journalQuery.isLoading) return <Screen><ActivityIndicator size="large" color={colors.primary} /></Screen>;
  if (journalQuery.isError) return <Screen><ErrorState message="Could not load entry." onRetry={() => journalQuery.refetch()} /></Screen>;

  const { trade } = journalQuery.data!;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tradeCard}>
          <Text style={styles.tradeSymbol}>{trade.symbol}</Text>
          <Text style={styles.tradeMeta}>{trade.tradeType} {formatShares(trade.sharesTimes1000)} shares @ {formatCurrency(trade.priceCents)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Investment Thesis</Text>
          <TextInput
            style={styles.textArea}
            multiline
            placeholder="Why did you make this trade? What was your plan?"
            placeholderTextColor={colors.textHint}
            value={thesis}
            onChangeText={setThesis}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Confidence Level</Text>
          <View style={styles.chipRow}>
            {confidenceLevels.map((lvl) => (
              <Pressable key={lvl} style={[styles.chip, confidence === lvl && styles.activeChip]} onPress={() => setConfidence(lvl)}>
                <Text style={[styles.chipText, confidence === lvl && styles.activeChipText]}>{lvl}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Mood / Emotion</Text>
          <View style={styles.chipRow}>
            {moods.map((m) => (
              <Pressable key={m} style={[styles.chip, mood === m && styles.activeChip]} onPress={() => setMood(m)}>
                <Text style={[styles.chipText, mood === m && styles.activeChipText]}>{m}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Lessons Learned</Text>
          <TextInput
            style={styles.textArea}
            multiline
            placeholder="What did this trade teach you?"
            placeholderTextColor={colors.textHint}
            value={lesson}
            onChangeText={setLesson}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Mistake Category (if any)</Text>
          <View style={styles.chipRow}>
            {mistakes.map((m) => (
              <Pressable key={m} style={[styles.chip, mistake === m && styles.activeChip]} onPress={() => setMistake(m)}>
                <Text style={[styles.chipText, mistake === m && styles.activeChipText]}>{m}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable style={styles.saveButton} onPress={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.saveButtonText}>Save Entry</Text>}
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  tradeCard: { backgroundColor: colors.surface, padding: 16, borderRadius: 16, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: colors.primary },
  tradeSymbol: { color: colors.text, fontSize: 20, fontWeight: '900' },
  tradeMeta: { color: colors.textMuted, marginTop: 4 },
  section: { marginBottom: 24 },
  label: { color: colors.text, fontSize: 14, fontWeight: '800', marginBottom: 12 },
  textArea: { backgroundColor: colors.surface, borderRadius: 12, padding: 12, color: colors.text, fontSize: 16, minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: colors.border },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  activeChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  activeChipText: { color: colors.text },
  saveButton: { backgroundColor: colors.primary, padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 12 },
  saveButtonText: { color: colors.text, fontSize: 16, fontWeight: '900' },
});
