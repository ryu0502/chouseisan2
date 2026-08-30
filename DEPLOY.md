# デプロイ手順 (Cloudflare Pages)

このフォルダの中身をそのまま、今使っている Cloudflare Pages プロジェクト
(`chosesan-kai-1`) にアップロードしてください。

```
cloudflare-deploy/
├── schedule-calendar.html   # アプリ本体
├── _redirects               # /schedule-calendar/xxx を全部このHTMLに振り向けるルール
└── functions/
    └── api/
        └── schedule.js       # 共有データの保存・取得API (Pages Functions)
```

## 1. KVネームスペースを作成してバインドする(初回だけ)

1. Cloudflareダッシュボード → **Workers & Pages** → **KV** → **Create namespace**
   名前は何でも良い(例: `schedule-kv`)。
2. 対象のPagesプロジェクト(`chosesan-kai-1`) → **Settings** → **Functions**
   → **KV namespace bindings** → **Add binding**
   - Variable name: `SCHEDULE_KV` (←コードと完全一致させる)
   - KV namespace: 上で作った namespace を選択
3. 保存すると、次回以降のデプロイからこのバインドが有効になります。

wrangler CLIでデプロイする場合は `wrangler.toml` に以下を追記してください。

```toml
[[kv_namespaces]]
binding = "SCHEDULE_KV"
id = "xxxxxxxx"  # 作成したnamespaceのID
```

## 2. アップロード

いつもの方法(ダッシュボードのドラッグ&ドロップ、または連携しているGitリポジトリへのpush、
または `wrangler pages deploy` )で、このフォルダの中身をそのままデプロイしてください。
`_redirects` と `functions/` はプロジェクトのルート直下に置く必要があります。

## 3. 各人のURL

```
https://8760fc25.chosesan-kai-1.pages.dev/schedule-calendar/ryu       → ☕
https://8760fc25.chosesan-kai-1.pages.dev/schedule-calendar/sinome    → 👻
https://8760fc25.chosesan-kai-1.pages.dev/schedule-calendar/koromo   → 衣
https://8760fc25.chosesan-kai-1.pages.dev/schedule-calendar/teketeke → 🤍
```

それぞれのURLでは、その人の時間だけ追加・編集・削除ができます。他の人の予定は
閲覧のみ(削除・編集ボタンは出ません)。`/schedule-calendar` (末尾に名前が付いていない)
で開いた場合は、全員分を見られる閲覧専用モードになります。

## 注意点

- データは全ユーザー共通の1つのKVキーに保存されるシンプルな仕組みです。
  ほぼ同時に複数人が保存すると、ごく稀に後から保存した内容が直前の保存を
  上書きする可能性があります(4人程度の少人数利用なら実用上問題ない想定)。
- 本格的な認証は入れていません。URLを知っていれば誰でもそのURLの人として
  編集できてしまうため、URLは友人内だけで共有してください。
- ローカルで `schedule-calendar.html` を直接ダブルクリックして開いても
  `/api/schedule` に届かずデータの保存・共有はできません。動作確認は
  デプロイ後(または `wrangler pages dev` )に行ってください。
