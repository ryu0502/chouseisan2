// Cloudflare Pages Functions のキャッチオールルート。
// /chouseisan-kai/repoyaru/ryu 等、/chouseisan-kai/repoyaru/ 配下のどんなパスでも
// リダイレクトせずに app.html の内容をそのまま返す。
// Cloudflareは「/app.html」のような拡張子付きパスを自動で「/app」へ308リダイレクトするため、
// env.ASSETS.fetch() には拡張子を外した "/app" を渡す。

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  url.pathname = '/app';
  return env.ASSETS.fetch(new Request(url, request));
}
