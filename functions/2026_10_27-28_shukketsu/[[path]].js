// 旧URL /2026_10_27-28_shukketsu/ 配下。共有済みのリンクが切れないよう、新しいURLへ転送する。
export async function onRequest({ request }) {
  const url = new URL(request.url);
  url.pathname = '/attendance_confirmation';
  return Response.redirect(url.toString(), 301);
}
