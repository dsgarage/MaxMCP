#!/bin/bash
# MaxMCP セットアップスクリプト（Max Package 版）
set -e

echo ""
echo "╔══════════════════════════════════╗"
echo "║       MaxMCP セットアップ        ║"
echo "╚══════════════════════════════════╝"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# --- 環境チェック ---
echo "[1/3] 環境チェック..."

if ! command -v node &>/dev/null; then
  echo "  ✗ Node.js が見つかりません"
  echo "    https://nodejs.org/ からインストールしてください"
  exit 1
fi

NODE_MAJOR=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "  ✗ Node.js $(node -v) → 22 以上が必要です"
  exit 1
fi
echo "  ✓ Node.js $(node -v)"

# --- ポート確認 ---
PORT_PID=$(lsof -t -i :8080 2>/dev/null || true)
if [ -n "$PORT_PID" ]; then
  echo "  ⚠ ポート 8080 が使用中 (PID: $PORT_PID)"
  read -p "  終了しますか？ [Y/n] " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    kill "$PORT_PID" 2>/dev/null && sleep 1
    echo "  ✓ 終了しました"
  fi
else
  echo "  ✓ ポート 8080 OK"
fi

# --- 依存パッケージ ---
echo ""
echo "[2/3] 依存パッケージをインストール..."

cd "$SCRIPT_DIR/server"
npm install --silent 2>/dev/null
echo "  ✓ サーバー依存パッケージ"

# javascript/ 用の node_modules（ws のみ）
cd "$SCRIPT_DIR/javascript"
if [ ! -d "node_modules/ws" ]; then
  cat > package.json << 'JSPKG'
{ "private": true, "dependencies": { "ws": "^8.18.0" } }
JSPKG
  npm install --silent 2>/dev/null
fi
cd "$SCRIPT_DIR"
echo "  ✓ クライアント依存パッケージ"

# --- 完了 ---
echo ""
echo "[3/3] 動作確認..."
echo "  ✓ セットアップ完了"

echo ""
echo "╔══════════════════════════════════╗"
echo "║       セットアップ完了！         ║"
echo "╚══════════════════════════════════╝"
echo ""
echo "次のステップ:"
echo ""
echo "  1. ~/.claude.json に以下を追加:"
echo ""
echo "     {"
echo "       \"mcpServers\": {"
echo "         \"max-mcp\": {"
echo "           \"command\": \"node\","
echo "           \"args\": [\"$SCRIPT_DIR/server/index.mjs\"]"
echo "         }"
echo "       }"
echo "     }"
echo ""
echo "  2. Claude Code を起動"
echo "  3. Max 9 → Extras メニュー → MaxMCP_Client"
echo "  4. Status が connected で準備完了！"
echo ""
