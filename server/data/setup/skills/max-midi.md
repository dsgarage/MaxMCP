---
name: max-midi
description: MIDI 入力構成（notein → mtof → poly~ でポリフォニック対応）
argument-hint: "MIDI構成を説明してください（例: '4音ポリシンセ', 'ドラムマッピング', 'CC でフィルター制御'）"
allowed-tools:
  - mcp
---

# /max-midi — MIDI 入力構成

ユーザーの説明に基づき、MIDI 入力パッチを構築します。

## 手順

1. `max.search.pattern` で MIDI パターンを検索
2. `max.patcher.info` で現在のパッチ状態を確認
3. MIDI 入力オブジェクト（notein / ctlin / bendin 等）を配置
4. ノート処理（mtof / stripnote 等）を追加
5. ポリフォニック対応が必要な場合は poly~ を構築
6. poly~ 内部パッチ（thispoly~ + midinote / noteout 等）を生成
7. 出力段を接続
8. コメントでセクションラベルを付与

## テンプレート種別

| 種別 | 入力 | 処理 | 用途 |
|------|------|------|------|
| モノフォニック | notein → stripnote | mtof → osc~ | リードシンセ |
| ポリフォニック | notein → poly~ | thispoly~ + mtof | コード・パッド |
| ドラム | notein → select | ノート番号分岐 | ドラムマシン |
| CC コントロール | ctlin | scale → パラメータ | フィルター・FX |
| ピッチベンド | bendin | scale → 周波数補正 | 表現力強化 |
| MPE | mpeparse | チャンネル別処理 | MPE コントローラ |

## 引数: $ARGUMENTS

ユーザーの説明: "$ARGUMENTS"

上記の説明に最も合うテンプレートを選択し、パッチを構築してください。

## 重要ルール
- `notein` のベロシティ 0 はノートオフとして処理すること
- `stripnote` でノートオフをフィルタリングすること（必要に応じて）
- `poly~` の `@steal 1` でボイススティールを有効にすること
- `poly~` 内では `thispoly~` で `mute 1` を使い、未使用ボイスを消音すること
- CC 値（0-127）は `scale` で適切な範囲にマッピングすること
- MIDI チャンネルフィルタリングが必要な場合は notein の第3アウトレットを使うこと
