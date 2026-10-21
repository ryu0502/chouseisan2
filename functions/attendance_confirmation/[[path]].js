// /attendance_confirmation/ 配下(末尾スラッシュ付きなど)のパスでも shukketsu.html を返す。

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  url.pathname = '/shukketsu';
  return env.ASSETS.fetch(new Request(url, request));
}
