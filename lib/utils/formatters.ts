import { formatDistanceToNowStrict } from 'date-fns';

export function formatPrice(price: number): string {
  if (price >= 1) {
    return price.toFixed(2);
  }
  if (price >= 0.01) {
    return price.toFixed(4);
  }
  return price.toFixed(6);
}

export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1_000_000) {
    return `$${(marketCap / 1_000_000).toFixed(1)}M`;
  }
  if (marketCap >= 1_000) {
    return `$${(marketCap / 1_000).toFixed(1)}K`;
  }
  return `$${marketCap.toFixed(0)}`;
}

export function formatVolume(volume: number): string {
  if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(1)}K`;
  }
  return `$${volume.toFixed(0)}`;
}

export function formatAge(timestamp: number): string {
  const now = Date.now();
  const ageInSeconds = Math.floor((now - timestamp) / 1000);

  if (ageInSeconds < 60) {
    return `${ageInSeconds}s`;
  }
  if (ageInSeconds < 3600) {
    return `${Math.floor(ageInSeconds / 60)}m`;
  }
  if (ageInSeconds < 86400) {
    return `${Math.floor(ageInSeconds / 3600)}h`;
  }
  return `${Math.floor(ageInSeconds / 86400)}d`;
}

export function formatPercentage(percentage: number): string {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
}

export function truncateAddress(address: string, start = 4, end = 4): string {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function formatNumber(num: number, decimals = 2): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(decimals)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(decimals)}K`;
  }
  return num.toFixed(decimals);
}
