import { NextResponse } from 'next/server';

function formatMC(value: number): string {
  if (!value) return '$0';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${value.toFixed(0)}`;
}

export async function GET() {
  try {
    console.log('[MigratedAPI] 🔍 Fetching trending tokens...');

    // Tentar buscar top boosted tokens (mais confiável)
    try {
      const boostResponse = await fetch(
        'https://api.dexscreener.com/token-boosts/top/v1',
        {
          headers: { Accept: 'application/json' },
          next: { revalidate: 60 },
        }
      );

      if (boostResponse.ok) {
        const boostData = await boostResponse.json();
        const solanaTokens = boostData
          .filter((t: any) => t.chainId === 'solana')
          .slice(0, 30)
          .map((t: any) => ({
            mint: t.tokenAddress,
            name: t.description || 'Unknown',
            symbol: t.description?.split(' ')[0] || '???',
            image: t.icon || null,
            url: t.url,
            marketCapFormatted: 'Boosted',
            volumeFormatted: '-',
          }));

        if (solanaTokens.length > 0) {
          console.log('[MigratedAPI] ✅ Found', solanaTokens.length, 'boosted tokens');
          return NextResponse.json(solanaTokens);
        }
      }
    } catch (boostError) {
      console.log('[MigratedAPI] Boost API failed, trying pairs...');
    }

    // Fallback: buscar pairs populares
    const pairsResponse = await fetch(
      'https://api.dexscreener.com/latest/dex/tokens/solana',
      {
        headers: { Accept: 'application/json' },
        next: { revalidate: 60 },
      }
    );

    if (!pairsResponse.ok) {
      console.error('[MigratedAPI] ❌ Pairs API failed:', pairsResponse.status);
      return NextResponse.json([]);
    }

    const pairsData = await pairsResponse.json();
    const GRADUATION_THRESHOLD = 69000; // $69K graduation threshold

    const pairs = pairsData.pairs
      ?.filter((p: any) => {
        return p.chainId === 'solana' && p.fdv && p.fdv >= GRADUATION_THRESHOLD && p.volume?.h24 > 1000;
      })
      ?.sort((a: any, b: any) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
      ?.slice(0, 30)
      ?.map((p: any) => ({
        mint: p.baseToken?.address,
        name: p.baseToken?.name || 'Unknown',
        symbol: p.baseToken?.symbol || '???',
        image: p.info?.imageUrl || null,
        marketCapFormatted: formatMC(p.fdv),
        volumeFormatted: formatMC(p.volume?.h24 || 0),
        url: p.url || '',
      }));

    console.log('[MigratedAPI] ✅ Found', pairs?.length || 0, 'trending tokens');
    return NextResponse.json(pairs || []);
  } catch (error) {
    console.error('[MigratedAPI] ❌ Error:', error);
    return NextResponse.json([]);
  }
}
