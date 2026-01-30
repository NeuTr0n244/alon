'use client';

import { useState } from 'react';

interface TokenImageProps {
  src: string | null;
  symbol: string;
  size?: number;
}

export function TokenImage({ src, symbol, size = 40 }: TokenImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(!!src);

  // Gerar cor baseada no symbol
  const getColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  if (!src || error) {
    return (
      <div
        className="flex items-center justify-center rounded-lg font-bold"
        style={{
          width: size,
          height: size,
          background: getColor(symbol || 'TOKEN'),
          color: 'white',
          fontSize: size * 0.4,
        }}
      >
        {symbol?.slice(0, 2).toUpperCase() || '??'}
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      {loading && (
        <div
          className="rounded-lg animate-pulse"
          style={{
            width: size,
            height: size,
            background: '#333',
            position: 'absolute',
          }}
        />
      )}
      <img
        src={src}
        alt={symbol}
        width={size}
        height={size}
        className="rounded-lg object-cover"
        style={{
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.2s',
        }}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}
