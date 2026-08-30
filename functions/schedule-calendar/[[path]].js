// Cloudflare Pages Functions のキャッチオールルート。
// /schedule-calendar/ryu 等、/schedule-calendar/ 配下のどんなパスでも
// リダイレクトせずに app.html の内容をそのまま返す。

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  url.pathname = '/app.html';
  return env.ASSETS.fetch(new Request(url, request));
}
