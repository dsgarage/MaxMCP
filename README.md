# MaxMCP — Max / Ableton Live を Claude Code から操作

「こういう音を作りたい」と伝えるだけで、Max パッチを自動構築する MCP サーバーです。

## インストール

### 1. パッケージ配置

この `MaxMCP` フォルダを以下に配置してください:

- **macOS**: `~/Documents/Max 9/Packages/MaxMCP`
- **Windows**: `%USERPROFILE%\Documents\Max 9\Packages\MaxMCP`

### 2. セットアップ

```bash
cd ~/Documents/Max\ 9/Packages/MaxMCP
bash setup.sh
```

### 3. Claude Code に登録

setup.sh 完了時に表示される設定を `~/.claude.json` に追加してください。

### 4. Max で接続

1. Max 9 を起動
2. **Extras** メニュー → **MaxMCP_Client** を開く
3. Status が **connected** になれば準備完了

## 必要なもの

| ソフトウェア | バージョン |
|------------|----------|
| Node.js | 22 以上 |
| Max | 9.x |
| Claude Code | 最新 |

## できること

### パッチ構築
- `/max-synth` — シンセサイザー構築
- `/max-fx` — エフェクトチェーン
- `/max-sampler` — サンプラー構築
- `/max-midi` — MIDI 入力構成
- `/max-jitter` — 映像パイプライン
- `/max-reactive` — 音声連動映像

### 調査・学習
- `/max-explain cycle~` — オブジェクト解説
- `/max-compare` — オブジェクト比較
- `/max-debug` — デバッグ支援
- `/max-reference` — 公式ドキュメント参照

### Ableton Live
- `/ableton-track` — トラック構成
- `/ableton-clip` — クリップ制作
- `/ableton-arrange` — アレンジ構成
- `/ableton-mixdown` — ミックスダウン

全 19 Skills が利用可能です。

## トラブルシューティング

### Max に接続できない

```bash
# ポート 8080 の確認
lsof -i :8080

# 既存プロセスを終了
kill $(lsof -t -i :8080)
```

### Claude Code で MCP ツールが使えない

1. Claude Code を再起動
2. `/mcp` で `max-mcp` を Reconnect

## ライセンス

MIT
