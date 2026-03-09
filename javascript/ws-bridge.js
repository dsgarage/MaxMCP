var maxApi = require("max-api");

var WebSocket;
try {
  WebSocket = require("ws");
} catch (e) {
  maxApi.post("MaxMCP ERROR: ws not found - run 'script npm install' first");
}

// --- 設定 ---
var DEFAULT_HOST = "localhost";
var DEFAULT_PORT = 8080;
var RECONNECT_BASE_MS = 3000;
var RECONNECT_MAX_MS = 30000;
var AUTO_CONNECT_DELAY = 1000;

// --- 状態 ---
var ws = null;
var clientId = "max-client-1";
var reconnectTimer = null;
var reconnectAttempt = 0;
var isIntentionalClose = false;
var currentHost = DEFAULT_HOST;
var currentPort = DEFAULT_PORT;

// --- ステータス通知 ---
function setStatus(state, detail) {
  maxApi.outlet("status", state);
  if (detail) {
    maxApi.post("MaxMCP: " + state + " - " + detail);
  } else {
    maxApi.post("MaxMCP: " + state);
  }
}

// --- 接続 ---
function connect(host, port) {
  if (!WebSocket) {
    setStatus("error", "ws module not loaded");
    return;
  }

  currentHost = host || DEFAULT_HOST;
  currentPort = port || DEFAULT_PORT;
  var url = "ws://" + currentHost + ":" + currentPort;

  if (ws) {
    try { ws.close(); } catch (e) {}
    ws = null;
  }

  isIntentionalClose = false;
  setStatus("connecting", url);

  try {
    ws = new WebSocket(url);
  } catch (e) {
    setStatus("error", e.message);
    scheduleReconnect();
    return;
  }

  // 接続タイムアウト（5秒）
  var connectTimeout = setTimeout(function () {
    if (ws && ws.readyState === 0) {
      ws.close();
    }
  }, 5000);

  ws.on("open", function () {
    clearTimeout(connectTimeout);
    reconnectAttempt = 0;
    setStatus("connected");
    ws.send(JSON.stringify({
      type: "register",
      clientId: clientId,
      clientType: "max",
      patchName: ""
    }));
  });

  ws.on("message", function (data) {
    var msg;
    try { msg = JSON.parse(data.toString()); } catch (e) { return; }

    if (msg.type === "registered") {
      maxApi.post("MaxMCP: Registered as " + msg.clientId);
      maxApi.outlet("info", "registered", msg.clientId);
    } else if (msg.type === "command") {
      maxApi.outlet("command", msg.id, msg.action, JSON.stringify(msg.params));
    }
  });

  ws.on("close", function () {
    clearTimeout(connectTimeout);
    ws = null;
    if (!isIntentionalClose) {
      setStatus("server not running");
      scheduleReconnect();
    }
  });

  ws.on("error", function () {
    // close イベントで処理するため、ここでは何もしない
  });
}

// --- 自動再接続（指数バックオフ）---
function scheduleReconnect() {
  if (isIntentionalClose) return;

  reconnectAttempt++;
  var delay = Math.min(
    RECONNECT_BASE_MS * Math.pow(2, reconnectAttempt - 1),
    RECONNECT_MAX_MS
  );

  if (reconnectAttempt <= 3) {
    maxApi.post("MaxMCP: Retry in " + (delay / 1000) + "s (attempt " + reconnectAttempt + ")");
  }

  reconnectTimer = setTimeout(function () {
    reconnectTimer = null;
    connect(currentHost, currentPort);
  }, delay);
}

// --- 切断 ---
function disconnect() {
  isIntentionalClose = true;
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  reconnectAttempt = 0;
  if (ws) { try { ws.close(); } catch (e) {} ws = null; }
  setStatus("disconnected");
}

// --- Max メッセージハンドラー ---

maxApi.addHandler("connect", function () {
  reconnectAttempt = 0;
  connect(arguments[0], arguments[1]);
});

maxApi.addHandler("disconnect", function () {
  disconnect();
});

maxApi.addHandler("response", function (commandId, resultJson) {
  if (!ws || ws.readyState !== 1) return;
  ws.send(JSON.stringify({ type: "response", id: commandId, result: JSON.parse(resultJson) }));
});

maxApi.addHandler("error", function (commandId, errorMessage) {
  if (!ws || ws.readyState !== 1) return;
  ws.send(JSON.stringify({ type: "error", id: commandId, error: errorMessage }));
});

maxApi.addHandler("clientId", function (id) {
  clientId = id;
  maxApi.post("MaxMCP: clientId = " + id);
});

// --- 起動完了 → 自動接続 ---
maxApi.post("MaxMCP ws-bridge.js loaded");
setStatus("waiting", "auto-connect in " + (AUTO_CONNECT_DELAY / 1000) + "s");

setTimeout(function () {
  connect(DEFAULT_HOST, DEFAULT_PORT);
}, AUTO_CONNECT_DELAY);
