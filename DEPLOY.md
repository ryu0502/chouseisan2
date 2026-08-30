# デプロイ手順 (Cloudflare Pages + GitHub連携)

このプロジェクトは GitHub リポジトリ **ryu0502/chosesan_kai** と Cloudflare Pages
プロジェクト **chosesan-kai-1** が連携済みです。`main` ブランチに push すると
自動でビルド・デプロイされます(ダッシュボードでの直接アップロードは廃止しました。
Pages Functionsが正しく有効化されないため)。

```
chosesan_kai/            (このフォルダはリポジトリの内容と同期したローカルコピー)
├── app.html              # アプリ本体(旧 schedule-calendar.html)
└── functions/
    ├── api/
    │   └── schedule.js                    # 共有データの保存・取得API
    └── chouseisan-kai/
        ├── repoyaru.js                     # /chouseisan-kai/repoyaru (裸のパス)用
        └── repoyaru/
            └── [[path]].js                 # /chouseisan-kai/repoyaru/xxx (ユーザー別パス)用
```

## なぜ `_redirects` を使っていないか

当初 `_redirects` でルーティングしようとしましたが、Cloudflareの静的アセット側の
自動リダイレクト処理と干渉してうまく機能しませんでした。代わりに **Pages Functions
のキャッチオールルート**(`functions/chouseisan-kai/repoyaru.js` と
`functions/chouseisan-kai/repoyaru/[[path]].js`)で `env.ASSETS.fetch()` を使い、
`app.html` の内容を直接返す方式にしています。

**重要**: `env.ASSETS.fetch()` に渡すパスは拡張子なしの `/app` にしてください。
`/app.html` を渡すと、Cloudflareが自動で `/app` へ308リダイレクトしてしまい、
そのリダイレクトがそのままクライアントに返ってしまいます(実際にハマった箇所)。

## URLのパス構造を変える場合

`/chouseisan-kai/repoyaru` の部分を変えたい場合は、`functions/` 以下のフォルダ・
ファイル名をそのパスと同じ構造にリネームしてください(中身は変更不要、
`env.ASSETS.fetch()` で常に `/app` を返しているだけなので、どのパスに置いても
同じ挙動になります)。

## 反映する手順

1. `chosesan_kai/` フォルダ内のファイルを編集
2. ローカルにクローンしてあるリポジトリ(またはこのフォルダ自体)で
   ```
   git add -A
   git commit -m "変更内容"
   git push origin main
   ```
3. push後、Cloudflareが自動でビルド・デプロイ(数十秒程度)
4. `https://chosesan-kai-1.pages.dev/chouseisan-kai/repoyaru` などで確認

## KVネームスペースのバインディング(設定済み)

`/api/schedule` が使う共有データストレージです。Cloudflareダッシュボード →
`chosesan-kai-1` プロジェクト → Settings → Functions → KV namespace bindings
で `SCHEDULE_KV` という変数名でバインド済みです。再作成する場合は同じ変数名にして
ください(コード内の `env.SCHEDULE_KV` と一致させる必要があります)。

## 各人のURL

```
https://chosesan-kai-1.pages.dev/chouseisan-kai/repoyaru/ryu       → ☕
https://chosesan-kai-1.pages.dev/chouseisan-kai/repoyaru/teketeke  → 👻
https://chosesan-kai-1.pages.dev/chouseisan-kai/repoyaru/koromo    → 衣
https://chosesan-kai-1.pages.dev/chouseisan-kai/repoyaru/sinome    → 🤍
```

それぞれのURLでは、その人の時間だけ(1日1件まで)登録・編集・削除ができます。
他の人の予定は閲覧のみ。名前なしの `/chouseisan-kai/repoyaru` は全員分の閲覧専用モード。

## 注意点

- データは全ユーザー共通の1つのKVキーに保存されるシンプルな仕組みです。
  ほぼ同時に複数人が保存すると、ごく稀に後から保存した内容が直前の保存を
  上書きする可能性があります(4人程度の少人数利用なら実用上問題ない想定)。
- 本格的な認証は入れていません。URLを知っていれば誰でもそのURLの人として
  編集できてしまうため、URLは友人内だけで共有してください。
- ローカルで `app.html` を直接ダブルクリックして開いても `/api/schedule` に
  届かずデータの保存・共有はできません。動作確認はデプロイ後に行ってください。
