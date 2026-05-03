export function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function formatShares(sharesTimes1000: number): string {
  return (sharesTimes1000 / 1000).toLocaleString('en-US', { maximumFractionDigits: 3 });
}
