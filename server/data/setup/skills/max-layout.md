---
name: max-layout
description: Max パッチ整理（全オブジェクト再配置 + グリッドスナップ + パッチコード整理）
argument-hint: "整理対象を指定（省略時: パッチ全体）"
allowed-tools:
  - mcp
---

# /max-layout — パッチ整理

パッチ内のオブジェクトを信号フローに沿って再配置し、見やすく整理します。

## 手順

1. `max.patcher.snapshot` でパッチ構造を取得
2. 信号フローグラフを構築（トポロジカルソート）
3. 段（row）と列（column）を割り当て
4. `max.object.move` で各オブジェクトを再配置
5. `max.patcher.cleanup` でグリッドスナップ + パッチコードルーティング
6. `max.patcher.align` で最終整列

## 引数: $ARGUMENTS

整理対象: "$ARGUMENTS"（省略時はパッチ全体を整理）

## レイアウトルール
- 入力源（adc~, notein, jit.grab 等）を最上段に配置
- 出力先（dac~, jit.window 等）を最下段に配置
- 並列処理は横に並べる
- send/receive はペアの近くに配置
- コメントは対象オブジェクトの上に配置
- グリッド 15x15px にスナップ
