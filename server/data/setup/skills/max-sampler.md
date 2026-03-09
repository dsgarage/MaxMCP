---
name: max-sampler
description: Max サンプラー構築（buffer~ + groove~/play~ + エンベロープ制御）
argument-hint: "サンプラーの種類を説明してください（例: 'ワンショットドラム', 'ピッチ可変ループ', 'グラニュラー'）"
allowed-tools:
  - mcp
---

# /max-sampler — サンプラー構築

ユーザーの説明に基づき、サンプル再生パッチを構築します。

## 手順

1. `max.search.pattern` でサンプラーパターンを検索
2. `max.patcher.info` で現在のパッチ状態を確認
3. `max.object.create` で `buffer~` を配置（サンプル格納先）
4. 再生エンジン（groove~ / play~）を配置・接続
5. エンベロープ（function + line~）を構築
6. ピッチ・スタート/エンドポイント制御用 UI を追加
7. 出力段（gain~ → dac~）を接続
8. 必要に応じてコメントを追加

## テンプレート種別

| 種別 | 再生エンジン | エンベロープ | 用途 |
|------|------------|------------|------|
| ワンショット | play~ | function + line~ | ドラム・SE |
| ループ再生 | groove~ | なし（ループ属性） | 持続音・BGM |
| ピッチ可変 | groove~ + sig~ | function + line~ | 楽器的サンプラー |
| グラニュラー | groove~ + phasor~ | trapezoid~ | テクスチャ・アンビエント |
| マルチサンプル | poly~ + groove~ | function + line~ | 鍵盤サンプラー |

## 引数: $ARGUMENTS

ユーザーの説明: "$ARGUMENTS"

上記の説明に最も合うテンプレートを選択し、パッチを構築してください。
テンプレートに完全一致しない場合は、最も近いものをベースにカスタマイズしてください。

## 重要ルール
- `buffer~` には必ず名前を付けること（例: `buffer~ mySound`）
- `groove~` のチャンネル数は buffer~ と一致させること
- ファイル読み込みは `read` メッセージまたは `dropfile` で対応すること
- エンベロープなしで直接再生しないこと（クリックノイズ防止）
- gain~ で出力レベルを制御すること（直接 dac~ に繋がない）
- `info~` でサンプル長を取得し、再生範囲制御に使うこと
