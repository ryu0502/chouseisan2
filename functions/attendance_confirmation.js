// /attendance_confirmation にマッチするルート。shukketsu.html の内容をそのまま返す。
// Cloudflareは「/shukketsu.html」のような拡張子付きパスを自動で「/shukketsu」へ308リダイレクトするため、
// env.ASSETS.fetch() には拡張子を外した "/shukketsu" を渡す。

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  url.pathname = '/shukketsu';
  return env.ASSETS.fetch(new Request(url, request));
}
