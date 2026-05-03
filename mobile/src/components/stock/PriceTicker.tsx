import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/formatCurrency';

interface Props {
  priceCents: number;
}

export function PriceTicker({ priceCents }: Props): React.JSX.Element {
  const previous = useRef(priceCents);
  const flash = useSharedValue(0);
  const direction = priceCents >= previous.current ? colors.success : colors.danger;
  useEffect(() => {
    if (priceCents !== previous.current) {
      flash.value = withSequence(withTiming(1, { duration: 200 }), withTiming(0, { duration: 300 }));
      previous.current = priceCents;
    }
  }, [flash, priceCents]);
  const animatedStyle = useAnimatedStyle(() => ({ backgroundColor: flash.value > 0 ? `${direction}33` : 'transparent' }));
  return <Animated.View style={[styles.wrap, animatedStyle]}><Text style={styles.price}>{formatCurrency(priceCents)}</Text></Animated.View>;
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  price: { color: colors.text, fontVariant: ['tabular-nums'], fontWeight: '700' },
});
