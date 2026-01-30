export interface Token {
  signature: string;
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  description?: string;
  image?: string;
  creator?: string;
  createdAt: number;
  marketCap?: number;
  volume24h?: number;
  priceUsd?: number;
  priceNative?: number;
  replies?: number;
  retweets?: number;
  likes?: number;
  twitter?: string;
  telegram?: string;
  website?: string;
  isMigrated?: boolean;
  tradeCount?: number;
  holderCount?: number;
  percentage?: number;
}

export interface TokenTrade {
  signature: string;
  mint: string;
  sol_amount: number;
  token_amount: number;
  is_buy: boolean;
  user: string;
  timestamp: number;
  tx_index: number;
}

export interface WebSocketMessage {
  type: 'newToken' | 'trade' | 'error';
  data?: any;
  error?: string;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  external_url?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
}
