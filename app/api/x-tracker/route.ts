import { NextResponse } from 'next/server';

// Lista de instâncias Nitter para fallback
const NITTER_INSTANCES = [
  'nitter.net',
  'nitter.privacydev.net',
  'nitter.poast.org',
];

// Contas crypto para monitorar
const CRYPTO_ACCOUNTS = [
  'whale_alert',
  'CryptoNewsAlerts',
  'solaboratory',
  'pumaboratory',
];

interface Tweet {
  id: string;
  author: string;
  username: string;
  content: string;
  timestamp: string;
  avatar: string;
}

async function fetchFromNitter(instance: string, username: string): Promise<Tweet[]> {
  const url = `https://${instance}/${username}/rss`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 60 }, // Cache por 1 minuto
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xmlText = await response.text();

    // Parse XML RSS
    const items = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];

    const tweets: Tweet[] = items.slice(0, 10).map((item, index) => {
      const getContent = (tag: string) => {
        const match = item.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`, 's'));
        return match ? match[1].replace(/<!\[CDATA\[(.*?)\]\]>/s, '$1').trim() : '';
      };

      const title = getContent('title');
      const description = getContent('description');
      const pubDate = getContent('pubDate');
      const link = getContent('link');

      return {
        id: link || `${username}-${Date.now()}-${index}`,
        author: username.replace('_', ' ').split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
        username: `@${username}`,
        content: description || title,
        timestamp: pubDate || new Date().toISOString(),
        avatar: `https://unavatar.io/twitter/${username}`,
      };
    });

    return tweets;
  } catch (error) {
    console.error(`Failed to fetch from ${instance}:`, error);
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountsParam = searchParams.get('accounts');

  // Permitir customizar contas via query param
  const accounts = accountsParam
    ? accountsParam.split(',')
    : CRYPTO_ACCOUNTS;

  const allTweets: Tweet[] = [];

  // Tentar cada conta
  for (const account of accounts) {
    let success = false;

    // Tentar cada instância Nitter até conseguir
    for (const instance of NITTER_INSTANCES) {
      try {
        const tweets = await fetchFromNitter(instance, account);
        allTweets.push(...tweets);
        success = true;
        break; // Sucesso, pular para próxima conta
      } catch (error) {
        console.log(`Trying next instance for @${account}...`);
        continue;
      }
    }

    if (!success) {
      console.error(`Failed to fetch tweets for @${account} from all instances`);
    }
  }

  // Ordenar por timestamp (mais recente primeiro)
  allTweets.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return NextResponse.json({
    tweets: allTweets.slice(0, 20), // Retornar top 20
    timestamp: new Date().toISOString(),
  });
}
