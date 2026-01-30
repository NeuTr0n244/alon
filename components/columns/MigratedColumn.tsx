'use client';

import { useMigratedTokens } from '@/hooks/useMigratedTokens';
import { TokenImage } from '@/components/ui/TokenImage';

export function MigratedColumn() {
  const { tokens, loading, getAge } = useMigratedTokens();

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1a1a1a] flex items-center justify-between">
        <h2 className="text-white font-bold text-base">Migrated</h2>
        <span className="text-[#888] text-xs">Graduated tokens</span>
      </div>

      {/* Token List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
        {loading ? (
          <div className="text-center py-10 px-4">
            <div className="w-6 h-6 border-2 border-[#333] border-t-[#00ff00] rounded-full animate-spin mx-auto mb-3" />
            <div className="text-[#888] text-sm">Loading migrated tokens...</div>
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="text-[#888] text-sm mb-2">Waiting for migrations...</div>
            <div className="text-[#555] text-xs">
              Tokens appear when they graduate (~$69K MC)
            </div>
          </div>
        ) : (
          tokens.map((token) => (
            <div
              key={token.mint}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#111] cursor-pointer transition-colors mb-1"
              onClick={() => window.open(`https://pump.fun/coin/${token.mint}`, '_blank')}
            >
              <TokenImage src={token.image || null} symbol={token.symbol} size={40} />

              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm truncate">{token.name}</div>
                <div className="flex items-center gap-1 text-xs text-[#888]">
                  <span>{token.symbol}</span>
                  <span>• {getAge(token.createdAt)}</span>
                </div>
              </div>

              {token.marketCap && token.marketCap > 0 && (
                <div className="text-right">
                  <div className="text-sm text-[#00ff00] font-medium">
                    MC {(token.marketCap / 1000).toFixed(1)}K SOL
                  </div>
                </div>
              )}

              <button
                className="w-7 h-7 flex items-center justify-center rounded border border-[#333] text-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-colors text-base"
                onClick={(e) => e.stopPropagation()}
              >
                +
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
