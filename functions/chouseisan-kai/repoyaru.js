// /chouseisan-kai/repoyaru (末尾に名前が無い場合) にマッチするルート。
// [[path]].js は1つ以上のサブパスにしかマッチしないため、これで裸のパスをカバーする。
// Cloudflareは「/app.html」のような拡張子付きパスを自動で「/app」へ308リダイレクトするため、
// env.ASSETS.fetch() には拡張子を外した "/app" を渡す。

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  url.pathname = '/app';
  return env.ASSETS.fetch(new Request(url, request));
}
