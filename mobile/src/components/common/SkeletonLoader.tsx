import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { colors } from '../../theme/colors';

export function SkeletonLoader(): React.JSX.Element {
  const opacity = useSharedValue(0.35);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.9, { duration: 800 }), -1, true);
  }, [opacity]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <View style={styles.wrap}>{[0, 1, 2].map((item) => <Animated.View key={item} style={[styles.bar, animatedStyle]} />)}</View>;
}

const styles = StyleSheet.create({
  wrap: { gap: 12, padding: 16 },
  bar: { height: 64, borderRadius: 16, backgroundColor: colors.surface2 },
});
