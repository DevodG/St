import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { colors } from '../../theme/colors';

const slides = [
  { title: 'Welcome to StockLy', body: 'Paper trading means you practice with virtual money before risking real capital.' },
  { title: 'Your $100,000', body: 'Every account starts with $100,000 in simulated cash. No real money is used.' },
  { title: 'AI Coach', body: 'Ask StockLy Coach to explain moves, risk, and investing terms in plain English.' },
  { title: "Let's go", body: 'Search stocks, build a watchlist, place practice trades, and learn from the outcome.' },
];

export function OnboardingScreen({ onComplete }: { onComplete: () => void }): React.JSX.Element {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const next = () => index === slides.length - 1 ? onComplete() : setIndex(index + 1);
  return <View style={styles.wrap}><Animated.View key={slide.title} entering={FadeInRight} style={styles.card}><Text style={styles.title}>{slide.title}</Text><Text style={styles.body}>{slide.body}</Text></Animated.View><View style={styles.dots}>{slides.map((item, dotIndex) => <View key={item.title} style={[styles.dot, dotIndex === index && styles.activeDot]} />)}</View><Pressable style={styles.button} onPress={next}><Text style={styles.buttonText}>{index === slides.length - 1 ? 'Create portfolio' : 'Next'}</Text></Pressable></View>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 24, gap: 28 },
  card: { padding: 24, borderRadius: 28, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  title: { color: colors.text, fontSize: 34, fontWeight: '900', marginBottom: 12 },
  body: { color: colors.textMuted, fontSize: 17, lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textHint },
  activeDot: { width: 24, backgroundColor: colors.primary },
  button: { backgroundColor: colors.primary, padding: 16, borderRadius: 16, alignItems: 'center' },
  buttonText: { color: colors.text, fontWeight: '800' },
});
