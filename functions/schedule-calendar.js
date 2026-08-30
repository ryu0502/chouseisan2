// /schedule-calendar (末尾に名前が無い場合) にマッチするルート。
// [[path]].js は1つ以上のサブパスにしかマッチしないため、これで裸のパスをカバーする。

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  url.pathname = '/app.html';
  return env.ASSETS.fetch(new Request(url, request));
}
