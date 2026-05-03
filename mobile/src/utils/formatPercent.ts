export function formatBps(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}
