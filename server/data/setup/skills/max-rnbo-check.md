---
name: max-rnbo-check
description: RNBO 互換性チェック（パッチ内オブジェクトの RNBO 対応状況を診断）
argument-hint: "チェック対象を指定（省略時: 現在のパッチ全体）"
allowed-tools:
  - mcp
  - WebSearch
  - WebFetch
---

# /max-rnbo-check — RNBO 互換性チェック

パッチ内のオブジェクトが RNBO（Cycling '74 のクロスプラットフォームエクスポート機能）に対応しているかを診断します。

## 手順

1. `max.patcher.snapshot` でパッチ構造を取得
2. `max.object.list` で全オブジェクトを列挙
3. 各オブジェクトの RNBO 互換性を判定
4. 非互換オブジェクトの代替案を提示
5. RNBO エクスポートに向けた修正提案を出力

## 引数: $ARGUMENTS

チェック対象: "$ARGUMENTS"（省略時はパッチ全体を診断）

## RNBO 対応状況カテゴリ

| カテゴリ | 説明 | 対応 |
|---------|------|------|
| 完全対応 | そのまま RNBO で使用可能 | OK |
| 制限付き | 一部機能が制限される | 要確認 |
| 代替あり | RNBO 専用の代替オブジェクトがある | 要置換 |
| 非対応 | RNBO では使用不可 | 要再設計 |

## 主な非互換オブジェクト（参考）

| Max オブジェクト | 理由 | RNBO 代替 |
|----------------|------|----------|
| js / v8 | JavaScript 非対応 | codebox (C-like) |
| jit.* | Jitter 非対応 | なし |
| dict | 一部制限あり | list 操作で代替 |
| coll | ファイルベース非対応 | data / buffer |
| poly~ | 方式が異なる | polyphony~ |
| send~ / receive~ | 名前付き非対応 | 直接接続 |
| mc.* | MC 非対応 | 個別チャンネルで代替 |

## 出力フォーマット

### 診断結果サマリー
- 対応: X 個 / 制限付き: Y 個 / 非対応: Z 個

### 非互換オブジェクト詳細
各非互換オブジェクトについて:
- オブジェクト名と位置
- 非互換の理由
- 推奨される代替手段

### 修正アクションプラン
RNBO 対応にするための手順リスト

## 重要ルール
- RNBO の対応状況は頻繁に更新されるため、WebSearch で最新情報を確認すること
- 「非対応」でも workaround がある場合は提示すること
- codebox での C-like コードによる代替案も検討すること
- RNBO エクスポート対象（VST / Web / Raspberry Pi 等）によって制約が異なる場合は明示すること
