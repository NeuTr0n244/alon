'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { Token } from '@/types/token';
import { formatAge, formatMarketCap, formatVolume } from '@/lib/utils/formatters';
import { SocialIcon } from '@/components/ui/Icons';

interface TokenCardProps {
  token: Token;
}

export function TokenCard({ token }: TokenCardProps) {
  const [age, setAge] = useState(formatAge(token.createdAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setAge(formatAge(token.createdAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [token.createdAt]);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click if clicking on social icons
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    // Open token on pump.fun in new tab
    window.open(`https://pump.fun/coin/${token.mint}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="bg-[#111] hover:bg-[#1a1a1a] rounded-lg p-3 cursor-pointer transition-colors mb-2"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Token Image */}
        <div className="flex-shrink-0">
          {token.image ? (
            <Image
              src={token.image}
              alt={token.name}
              width={48}
              height={48}
              className="rounded-lg object-cover w-12 h-12"
              unoptimized
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const placeholder = parent.querySelector('.placeholder');
                  if (placeholder) {
                    (placeholder as HTMLElement).classList.remove('hidden');
                  }
                }
              }}
            />
          ) : null}
          <div className={`w-12 h-12 bg-gradient-to-br from-green/20 to-green/5 rounded-lg flex items-center justify-center text-green font-bold text-base border border-green/30 ${token.image ? 'hidden' : ''} placeholder`}>
            {token.symbol.slice(0, 2).toUpperCase()}
          </div>
        </div>

        {/* Token Info */}
        <div className="flex-1 min-w-0">
          {/* Name and Ticker */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm truncate">{token.name}</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#888] truncate">{token.symbol}</span>
                <span className="text-[#888]">•</span>
                <span className="text-[#888]">{age}</span>
              </div>
            </div>
            {/* Add Button */}
            <button
              className="bg-[#00ff00] text-black px-3 py-1 rounded text-xs font-bold hover:bg-[#00cc00] transition-colors flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              +
            </button>
          </div>

          {/* Creator */}
          {token.creator && (
            <p className="text-[10px] text-[#666] truncate mt-1">
              by {token.creator.slice(0, 8)}...
            </p>
          )}

          {/* Social Icons */}
          <div className="flex items-center gap-2 mt-2">
            <SocialIcon href={token.twitter} type="twitter" />
            <SocialIcon href={token.telegram} type="telegram" />
            <SocialIcon href={token.website} type="website" />
          </div>

          {/* Volume and Market Cap */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[#888]">
                V {formatVolume(token.volume24h || 0)}
              </span>
              <span className="text-[#00ff00] font-semibold">
                MC {formatMarketCap(token.marketCap || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
