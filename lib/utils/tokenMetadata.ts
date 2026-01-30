import { TokenMetadata } from '@/types/token';

const metadataCache = new Map<string, string | null>();

export async function fetchTokenImage(uri: string): Promise<string | null> {
  if (!uri) return null;

  // Check cache first
  if (metadataCache.has(uri)) {
    return metadataCache.get(uri) || null;
  }

  try {
    // Convert various URI formats to HTTP URLs
    let fetchUrl = uri;

    if (uri.startsWith('ipfs://')) {
      // IPFS format: ipfs://hash
      fetchUrl = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
    } else if (uri.startsWith('https://arweave.net/')) {
      // Already in correct format
      fetchUrl = uri;
    } else if (uri.startsWith('ar://')) {
      // Arweave format: ar://hash
      fetchUrl = uri.replace('ar://', 'https://arweave.net/');
    } else if (!uri.startsWith('http')) {
      // Assume it's an IPFS hash without protocol
      fetchUrl = `https://ipfs.io/ipfs/${uri}`;
    }

    console.log('[TokenMetadata] Fetching:', fetchUrl);

    const response = await fetch(fetchUrl, {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      console.warn('[TokenMetadata] Failed to fetch (status):', response.status, fetchUrl);
      metadataCache.set(uri, null);
      return null;
    }

    const metadata: TokenMetadata = await response.json();
    let imageUrl = metadata.image || null;

    if (!imageUrl) {
      console.warn('[TokenMetadata] No image in metadata:', fetchUrl);
      metadataCache.set(uri, null);
      return null;
    }

    // Convert IPFS/Arweave image URLs to HTTP gateway
    if (imageUrl.startsWith('ipfs://')) {
      imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
    } else if (imageUrl.startsWith('ar://')) {
      imageUrl = imageUrl.replace('ar://', 'https://arweave.net/');
    } else if (!imageUrl.startsWith('http')) {
      // Assume it's an IPFS hash
      imageUrl = `https://ipfs.io/ipfs/${imageUrl}`;
    }

    console.log('[TokenMetadata] Found image:', imageUrl);
    metadataCache.set(uri, imageUrl);
    return imageUrl;
  } catch (error) {
    console.warn('[TokenMetadata] Failed to fetch metadata:', uri, error);
    metadataCache.set(uri, null);
    return null;
  }
}

// Prefetch metadata for multiple tokens
export async function prefetchTokenMetadata(uris: string[]): Promise<void> {
  const promises = uris.map((uri) => fetchTokenImage(uri));
  await Promise.allSettled(promises);
}
