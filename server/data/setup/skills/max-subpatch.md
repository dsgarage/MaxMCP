---
name: max-subpatch
description: サブパッチ化（選択範囲を [p] サブパッチに変換し整理）
argument-hint: "サブパッチ化の対象を説明してください（例: 'フィルター部分をまとめたい', 'エンベロープ生成をサブパッチに'）"
allowed-tools:
  - mcp
---

# /max-subpatch — サブパッチ化

指定された範囲のオブジェクトを [p] サブパッチに変換し、パッチを整理します。

## 手順

1. `max.patcher.snapshot` でパッチ全体の構造を取得
2. `max.object.list` でオブジェクトと接続を確認
3. サブパッチ化対象のオブジェクト群を特定
4. 外部との接続点を分析し、必要な inlet / outlet 数を決定
5. `max.object.create` で `p サブパッチ名` を作成
6. サブパッチ内部に対象オブジェクトを再構築（inlet / outlet 含む）
7. 元のオブジェクトを `max.object.delete` で削除
8. 外部接続を `max.object.connect` で [p] に再接続
9. コメントでサブパッチの役割を記述

## 引数: $ARGUMENTS

対象: "$ARGUMENTS"

## サブパッチ設計ルール

| 要素 | ルール |
|------|--------|
| 命名 | 機能を表す名前（例: `p envelope`, `p filter`） |
| inlet | 左から制御順に配置（メイン信号が左端） |
| outlet | 左から出力順に配置（メイン出力が左端） |
| Signal vs Message | inlet~ / outlet~ と inlet / outlet を混在させない |
| コメント | サブパッチ内の先頭にコメントで目的を記述 |

## 重要ルール
- サブパッチ名は英語で機能を表すこと（例: `p oscillator`, `p mixer`）
- inlet / outlet の順序は左が最重要、右に行くほど補助的な信号にすること
- MSP 信号は `inlet~` / `outlet~` を使うこと（`inlet` / `outlet` と混同しない）
- サブパッチ内にもコメントを付けること（中を開いたときに理解できるように）
- サブパッチ化前後で動作が変わらないことを確認するため、接続を慎重にチェックすること
- trigger オブジェクトの評価順がサブパッチ化で変わらないよう注意すること
