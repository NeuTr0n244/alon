// Cache de imagens
const imageCache = new Map<string, string | null>();

export async function getTokenImage(mint: string): Promise<string | null> {
  // Verificar cache
  if (imageCache.has(mint)) {
    return imageCache.get(mint) || null;
  }

  try {
    console.log('[TokenImage] Fetching image for:', mint);

    // Tentar buscar do DexScreener
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${mint}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) {
      console.warn('[TokenImage] API failed:', response.status);
      imageCache.set(mint, null);
      return null;
    }

    const data = await response.json();
    const image = data.pairs?.[0]?.info?.imageUrl || null;

    if (image) {
      console.log('[TokenImage] ✅ Found image:', image);
    } else {
      console.log('[TokenImage] ⚠️ No image found');
    }

    imageCache.set(mint, image);
    return image;
  } catch (error) {
    console.warn('[TokenImage] Error fetching image:', error);
    imageCache.set(mint, null);
    return null;
  }
}

// Limpar cache periodicamente (evitar memory leak)
if (typeof window !== 'undefined') {
  setInterval(() => {
    if (imageCache.size > 500) {
      console.log('[TokenImage] Clearing cache...');
      imageCache.clear();
    }
  }, 5 * 60 * 1000); // A cada 5 minutos
}
