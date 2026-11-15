import { albumCount } from '../scripts/exercise-album.mjs';

// Fixed album only: this endpoint cannot be used as an arbitrary URL proxy.
export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('CDN-Cache-Control', 'no-store');
  response.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  if (request.method === 'OPTIONS') { response.statusCode = 204; response.end(); return; }
  if (request.method !== 'GET') { response.statusCode = 405; response.setHeader('Allow', 'GET, OPTIONS'); response.end(); return; }
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    const upstream = await fetch('https://photos.app.goo.gl/Z18e59WB1EXEJXeHA', {
      cache: 'no-store', signal: AbortSignal.timeout(25000),
      headers: { 'User-Agent': 'JapanesePracticeAlbumCounter/1.0' },
    });
    if (!upstream.ok) throw new Error('Album unavailable');
    const count = albumCount(await upstream.text());
    response.statusCode = 200;
    response.end(JSON.stringify({ count, checkedAt: new Date().toISOString() }));
  } catch {
    response.statusCode = 502;
    response.end(JSON.stringify({ error: 'Unable to read the live album count. Existing stamps are unchanged.' }));
  }
}
