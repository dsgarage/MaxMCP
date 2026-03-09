---
name: max-jitter
description: Jitter パイプライン構築（映像入力→エフェクト→出力）
argument-hint: "映像パイプラインを説明してください（例: 'カメラ入力にカラー補正', 'ムービー再生 + グリッチ', 'OpenGL 3D シーン'）"
allowed-tools:
  - mcp
---

# /max-jitter — Jitter パイプライン構築

ユーザーの説明に基づき、Jitter 映像パイプラインを構築します。

## 手順

1. `max.search.pattern` で Jitter パターンを検索
2. `max.patcher.info` で現在のパッチ状態を確認
3. 映像入力源を配置（jit.grab / jit.movie / jit.matrix 等）
4. エフェクトチェーンを構築（jit.op / jit.brcosa / jit.gl.slab 等）
5. 出力先を配置（jit.pwindow / jit.window / jit.gl.render 等）
6. `qmetro` または `jit.world` で描画タイミングを設定
7. 全接続を実行
8. コメントでセクションラベルを付与

## テンプレート種別

| 種別 | 入力 | 処理 | 出力 |
|------|------|------|------|
| カメラ入力 | jit.grab | jit.brcosa / jit.op | jit.pwindow |
| ムービー再生 | jit.movie | jit.chromakey / jit.op | jit.window |
| 画像処理 | jit.matrix | jit.convolve / jit.sobel | jit.pwindow |
| OpenGL 2D | jit.gl.texture | jit.gl.slab (GLSL) | jit.gl.render |
| OpenGL 3D | jit.gl.gridshape | jit.gl.material | jit.gl.render |
| GL テクスチャ | jit.gl.texture | jit.gl.pix | jit.world |

## 引数: $ARGUMENTS

ユーザーの説明: "$ARGUMENTS"

上記の説明に最も合うテンプレートを選択し、パッチを構築してください。

## 重要ルール
- `qmetro` で描画間隔を制御すること（metro ではなく qmetro を使う）
- `jit.world` 使用時は `@enable 1` を設定すること
- OpenGL パイプラインでは全オブジェクトに同じコンテキスト名を指定すること
- マトリクスのディメンション（dim）とプレーンカウント（planecount）を明示すること
- `jit.gl.render` 使用時は `erase` → `bang` → `swap` の順序を守ること
- 映像ソースが不要になったら `dispose` で解放すること
