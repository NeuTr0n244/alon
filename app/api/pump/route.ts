import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Pegar todos os parâmetros da query
  const offset = searchParams.get('offset') || '0';
  const limit = searchParams.get('limit') || '50';
  const sort = searchParams.get('sort') || 'created_timestamp';
  const order = searchParams.get('order') || 'DESC';
  const includeNsfw = searchParams.get('includeNsfw') || 'false';
  const migrated = searchParams.get('migrated');
  const complete = searchParams.get('complete');

  // Construir URL para pump.fun
  let url = `https://frontend-api.pump.fun/coins?offset=${offset}&limit=${limit}&sort=${sort}&order=${order}&includeNsfw=${includeNsfw}`;
  
  if (migrated !== null) {
    url += `&migrated=${migrated}`;
  }
  if (complete !== null) {
    url += `&complete=${complete}`;
  }

  console.log('[PumpProxy] Fetching:', url);

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 10 }, // Cache por 10 segundos
    });

    if (!response.ok) {
      console.error('[PumpProxy] Error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch from pump.fun', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[PumpProxy] Success:', Array.isArray(data) ? data.length : 0, 'tokens');

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('[PumpProxy] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from pump.fun', message: String(error) },
      { status: 500 }
    );
  }
}
