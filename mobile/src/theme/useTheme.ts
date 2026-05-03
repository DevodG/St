import { colors } from './colors';
import { typography } from './typography';

export function useTheme() {
  return { colors, typography, spacing: (value: number) => value * 8 };
}
