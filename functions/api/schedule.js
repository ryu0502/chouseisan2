// Cloudflare Pages Function: /api/schedule
// KVネームスペースを "SCHEDULE_KV" という名前でこのPagesプロジェクトにバインドしてください。
// (Cloudflareダッシュボード: Workers & Pages > 対象プロジェクト > Settings > Functions > KV namespace bindings)

const KEY = 'schedule-data';

export async function onRequestGet({ env }) {
  const raw = await env.SCHEDULE_KV.get(KEY);
  return new Response(raw || '{}', {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'invalid json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return new Response(JSON.stringify({ error: 'invalid body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await env.SCHEDULE_KV.put(KEY, JSON.stringify(body));
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
