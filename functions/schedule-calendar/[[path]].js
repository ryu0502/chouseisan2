// Cloudflare Pages Functions のキャッチオールルート。
// /schedule-calendar/ryu 等、/schedule-calendar/ 配下のどんなパスでも
// リダイレクトせずに schedule-calendar.html の内容をそのまま返す。
// (_redirects が効かない場合の確実な代替手段)

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  url.pathname = '/schedule-calendar.html';
  return env.ASSETS.fetch(new Request(url, request));
}
