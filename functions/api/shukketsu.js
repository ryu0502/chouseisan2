// Cloudflare Pages Function: /api/shukketsu
// /2026_10_27-28_shukketsu ページ用の共有データ(登録ユーザー + 予定)。
// 調整さん2と同じ "SCHEDULE_KV" バインディングを使い、別のキーに保存する。
//
// データ形式: { users: [{ name, createdAt }], schedule: { 'YYYY-MM-DD': [{ id, person, startMin, endMin }] } }
// 保存はクライアントから全体を送らず、操作(login / add / update / delete)単位でサーバ側で反映する。
// (人数が増えても、古い画面から保存した人が他人の登録を消してしまうことが起きにくいように)

const KEY = 'shukketsu-2026_10_27-28';
const NAME_MAX = 20;
const LATE_MIN = 48 * 60;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

async function load(env) {
  const raw = await env.SCHEDULE_KV.get(KEY);
  const data = raw ? JSON.parse(raw) : {};
  if (!Array.isArray(data.users)) data.users = [];
  if (typeof data.schedule !== 'object' || data.schedule === null) data.schedule = {};
  return data;
}

function normalizeName(name) {
  return typeof name === 'string' ? name.trim().replace(/\s+/g, ' ') : '';
}

// 大文字小文字・全角半角の違いだけの名前は同じユーザーとみなす
function nameKey(name) {
  return name.normalize('NFKC').toLowerCase();
}

function findUser(data, name) {
  const k = nameKey(name);
  return data.users.find(u => nameKey(u.name) === k) || null;
}

function validRange(startMin, endMin) {
  return Number.isInteger(startMin) && Number.isInteger(endMin)
    && startMin >= 0 && endMin <= LATE_MIN && startMin < endMin;
}

function validDate(date) {
  return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export async function onRequestGet({ env }) {
  return json(await load(env));
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: 'invalid json' }, 400);
  }
  if (typeof body !== 'object' || body === null) return json({ error: 'invalid body' }, 400);

  const name = normalizeName(body.name);
  if (!name || name.length > NAME_MAX) return json({ error: 'invalid name' }, 400);

  const data = await load(env);

  if (body.action === 'login') {
    // 既に登録済みならそのユーザー、未登録なら新規登録する
    let user = findUser(data, name);
    const isNew = !user;
    if (isNew) {
      user = { name, createdAt: Date.now() };
      data.users.push(user);
      await env.SCHEDULE_KV.put(KEY, JSON.stringify(data));
    }
    return json({ user, isNew, data });
  }

  const user = findUser(data, name);
  if (!user) return json({ error: 'unknown user' }, 403);
  if (!validDate(body.date)) return json({ error: 'invalid date' }, 400);
  const day = data.schedule[body.date] || [];

  if (body.action === 'add') {
    if (!validRange(body.startMin, body.endMin)) return json({ error: 'invalid range' }, 400);
    day.push({
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      person: user.name,
      startMin: body.startMin,
      endMin: body.endMin,
    });
  } else if (body.action === 'update') {
    if (!validRange(body.startMin, body.endMin)) return json({ error: 'invalid range' }, 400);
    const entry = day.find(e => e.id === body.id && e.person === user.name);
    if (!entry) return json({ error: 'not found' }, 404);
    entry.startMin = body.startMin;
    entry.endMin = body.endMin;
  } else if (body.action === 'delete') {
    const idx = day.findIndex(e => e.id === body.id && e.person === user.name);
    if (idx === -1) return json({ error: 'not found' }, 404);
    day.splice(idx, 1);
  } else {
    return json({ error: 'unknown action' }, 400);
  }

  if (day.length > 0) data.schedule[body.date] = day;
  else delete data.schedule[body.date];
  await env.SCHEDULE_KV.put(KEY, JSON.stringify(data));
  return json({ ok: true, data });
}
