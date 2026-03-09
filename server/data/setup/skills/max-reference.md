---
name: max-reference
description: Max 公式ドキュメント参照（オブジェクトのヘルプ・リファレンス取得）
argument-hint: "調べたい内容（例: 'poly~ の使い方', 'MSP のバッファ操作'）"
allowed-tools:
  - mcp
  - WebSearch
  - WebFetch
---

# /max-reference — 公式ドキュメント参照

Cycling '74 の公式ドキュメントから情報を取得します。

## 手順

1. `max.search.object` で内部DBから基本情報を取得
2. 必要に応じて WebSearch で `docs.cycling74.com` を検索
3. WebFetch で公式リファレンスページを取得
4. 情報を日本語に翻訳して提示

## 引数: $ARGUMENTS

検索内容: "$ARGUMENTS"

## 参照先
- `https://docs.cycling74.com/max8/refpages/<object_name>` — オブジェクトリファレンス
- `https://docs.cycling74.com/max8/tutorials/` — チュートリアル
- `https://docs.cycling74.com/max8/vignettes/` — ガイド記事
- `https://cycling74.com/forums/` — コミュニティフォーラム

## 出力フォーマット
- 公式の説明（日本語訳）
- インレット/アウトレット仕様
- 使用例
- 関連チュートリアルへのリンク
