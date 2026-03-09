/**
 * MaxMCP Client — Patcher API ラッパー (v8 用)
 *
 * Max の v8 (js) オブジェクト内で動作し、
 * Patcher API を使ったパッチ操作を担当する。
 *
 * node.script (ws-bridge.js) からコマンドを受け取り、
 * 実行結果を send/receive 経由で返送する。
 *
 * Max パッチ内接続:
 *   [route log.read audio.toggle patcher.lock ...]
 *     → [js patcher-api.js]
 *        inlet 0: commandId action paramsJson
 *
 *   [send mcp_response_#0] でレスポンスを返す
 *   → [receive mcp_response_#0] → node.script
 */

// v8 環境の Max グローバル
// アブストラクション内から親パッチを操作する
// this.patcher = アブストラクション自身
// this.patcher.parentpatcher = ユーザーのパッチ（操作対象）

autowatch = 1;
inlets = 1;
outlets = 1;

/**
 * 操作対象のパッチャーを取得
 * - parentpatcher があれば親（ユーザーのパッチ）を返す
 * - なければ自身のパッチャーを返す（直接配置の場合）
 */
function getTargetPatcher() {
  if (this.patcher.parentpatcher) {
    return this.patcher.parentpatcher;
  }
  return this.patcher;
}

// --- コマンドハンドラー ---

var handlers = {};

/**
 * max.log.read — Max コンソールログ取得
 * 注: 実際の Max コンソールログは Max API では直接取得できないため、
 *     内部バッファに蓄積したログを返す実装とする
 */
var logBuffer = [];
var MAX_LOG_LINES = 500;

handlers['log.read'] = function(params) {
  var lines = params.lines || 50;
  var filtered = logBuffer.slice(-lines);
  return {
    lines: filtered,
    total: logBuffer.length,
    returned: filtered.length,
  };
};

/**
 * max.audio.toggle — DSP ON/OFF 切替
 */
handlers['audio.toggle'] = function(params) {
  var enable = params.enable;
  var currentState;

  try {
    if (enable !== undefined) {
      // 明示的に ON/OFF
      max.message('dsp', enable ? 1 : 0);
      currentState = enable;
    } else {
      // トグル: 現在の状態を反転
      // Max の DSP 状態を取得
      currentState = max.isAudioOn ? max.isAudioOn() : undefined;
      if (currentState !== undefined) {
        max.message('dsp', currentState ? 0 : 1);
        currentState = !currentState;
      } else {
        // 状態取得不可の場合は ON にする
        max.message('dsp', 1);
        currentState = true;
      }
    }
  } catch (e) {
    return { error: 'DSP toggle failed: ' + e.message };
  }

  return {
    dsp: currentState ? 'on' : 'off',
    message: 'DSP ' + (currentState ? 'ON' : 'OFF'),
  };
};

/**
 * max.patcher.lock — パッチのロック/アンロック
 */
handlers['patcher.lock'] = function(params) {
  var lock = params.lock;
  var p = getTargetPatcher.call(this);

  try {
    if (lock !== undefined) {
      p.locked = lock;
    } else {
      p.locked = !p.locked;
    }
  } catch (e) {
    return { error: 'Patcher lock failed: ' + e.message };
  }

  return {
    locked: p.locked,
    message: 'パッチを' + (p.locked ? 'ロック' : 'アンロック') + 'しました',
  };
};

// --- Phase 2: パッチャー操作ハンドラー ---

/**
 * object.create — オブジェクト作成
 */
handlers['object.create'] = function(params) {
  try {
    var p = getTargetPatcher.call(this);
    var classname = params.classname;
    var args = params.args || [];
    var x = params.x || 30;
    var y = params.y || 30;
    var name = params.name;

    // newdefault(x, y, classname, ...args)
    var allArgs = [x, y, classname].concat(args);
    var obj = p.newdefault.apply(p, allArgs);

    if (!obj) {
      return { error: 'Failed to create object: ' + classname };
    }

    // スクリプティング名を設定
    if (name) {
      obj.varname = name;
    }

    var rect = obj.rect;
    return {
      id: obj.varname || String(obj),
      classname: classname,
      rect: [rect[0], rect[1], rect[2], rect[3]],
      name: obj.varname || null,
    };
  } catch (e) {
    return { error: 'object.create failed: ' + e.message };
  }
};

/**
 * object.delete — オブジェクト削除
 */
handlers['object.delete'] = function(params) {
  try {
    var p = getTargetPatcher.call(this);
    var obj = findObject.call(this, params.id);
    if (!obj) {
      return { error: 'Object not found: ' + params.id };
    }
    p.remove(obj);
    return { deleted: true, id: params.id };
  } catch (e) {
    return { error: 'object.delete failed: ' + e.message };
  }
};

/**
 * object.connect — オブジェクト間接続
 */
handlers['object.connect'] = function(params) {
  try {
    var p = getTargetPatcher.call(this);
    var srcObj = findObject.call(this, params.sourceId);
    var destObj = findObject.call(this, params.destId);
    if (!srcObj) return { error: 'Source not found: ' + params.sourceId };
    if (!destObj) return { error: 'Destination not found: ' + params.destId };

    p.connect(srcObj, params.outletIndex, destObj, params.inletIndex);
    return { connected: true, source: params.sourceId, dest: params.destId };
  } catch (e) {
    return { error: 'object.connect failed: ' + e.message };
  }
};

/**
 * object.disconnect — オブジェクト間切断
 */
handlers['object.disconnect'] = function(params) {
  try {
    var p = getTargetPatcher.call(this);
    var srcObj = findObject.call(this, params.sourceId);
    var destObj = findObject.call(this, params.destId);
    if (!srcObj) return { error: 'Source not found: ' + params.sourceId };
    if (!destObj) return { error: 'Destination not found: ' + params.destId };

    p.disconnect(srcObj, params.outletIndex, destObj, params.inletIndex);
    return { disconnected: true, source: params.sourceId, dest: params.destId };
  } catch (e) {
    return { error: 'object.disconnect failed: ' + e.message };
  }
};

/**
 * object.set — 属性設定
 */
handlers['object.set'] = function(params) {
  try {
    var obj = findObject.call(this, params.id);
    if (!obj) return { error: 'Object not found: ' + params.id };

    // setattr を試行、ダメなら message で設定
    try {
      obj.setattr(params.attribute, params.value);
    } catch (e1) {
      try {
        obj.message(params.attribute, params.value);
      } catch (e2) {
        return { error: 'Cannot set attribute: ' + params.attribute };
      }
    }
    return { id: params.id, attribute: params.attribute, success: true };
  } catch (e) {
    return { error: 'object.set failed: ' + e.message };
  }
};

/**
 * object.get — 属性取得
 */
handlers['object.get'] = function(params) {
  try {
    var obj = findObject.call(this, params.id);
    if (!obj) return { error: 'Object not found: ' + params.id };

    if (params.attribute) {
      var value = obj.getattr(params.attribute);
      return { id: params.id, attribute: params.attribute, value: value };
    }

    // 全属性を取得（主要なもの）
    var attrs = {};
    var commonAttrs = ['rect', 'varname', 'maxclass', 'bgcolor', 'textcolor', 'fontsize', 'fontname'];
    for (var i = 0; i < commonAttrs.length; i++) {
      try {
        attrs[commonAttrs[i]] = obj.getattr(commonAttrs[i]);
      } catch (e) {
        // 属性が存在しない場合はスキップ
      }
    }
    return { id: params.id, attributes: attrs };
  } catch (e) {
    return { error: 'object.get failed: ' + e.message };
  }
};

/**
 * object.move — オブジェクト移動
 */
handlers['object.move'] = function(params) {
  try {
    var obj = findObject.call(this, params.id);
    if (!obj) return { error: 'Object not found: ' + params.id };

    var rect = obj.rect;
    var w = rect[2] - rect[0];
    var h = rect[3] - rect[1];
    obj.rect = [params.x, params.y, params.x + w, params.y + h];

    return { id: params.id, moved: true, rect: [params.x, params.y, params.x + w, params.y + h] };
  } catch (e) {
    return { error: 'object.move failed: ' + e.message };
  }
};

/**
 * object.list — 全オブジェクト一覧
 */
handlers['object.list'] = function(params) {
  try {
    var p = getTargetPatcher.call(this);
    var objects = [];
    p.apply(function(obj) {
      var rect = obj.rect;
      objects.push({
        id: obj.varname || String(obj),
        classname: obj.maxclass,
        rect: [rect[0], rect[1], rect[2], rect[3]],
        name: obj.varname || null,
        inlets: obj.numinlets || 0,
        outlets: obj.numoutlets || 0,
      });
    });
    return { objects: objects, count: objects.length };
  } catch (e) {
    return { error: 'object.list failed: ' + e.message };
  }
};

/**
 * patcher.info — パッチャー基本情報
 */
handlers['patcher.info'] = function(params) {
  try {
    var p = getTargetPatcher.call(this);
    return {
      name: p.name,
      filepath: p.filepath || null,
      locked: p.locked,
      gridsize: p.gridsize || 15,
      count: p.count || 0,
    };
  } catch (e) {
    return { error: 'patcher.info failed: ' + e.message };
  }
};

/**
 * patcher.snapshot — 完全状態スナップショット
 */
handlers['patcher.snapshot'] = function(params) {
  try {
    var p = getTargetPatcher.call(this);
    var objects = [];
    var connections = [];

    p.apply(function(obj) {
      var rect = obj.rect;
      var objData = {
        id: obj.varname || String(obj),
        classname: obj.maxclass,
        rect: [rect[0], rect[1], rect[2], rect[3]],
        name: obj.varname || null,
        inlets: obj.numinlets || 0,
        outlets: obj.numoutlets || 0,
      };
      objects.push(objData);
    });

    // 接続情報（利用可能な場合）
    // Max API では直接的な接続列挙が限定的なため、
    // オブジェクトの patchline 情報から取得を試みる

    return {
      patcher: {
        name: p.name,
        filepath: p.filepath || null,
        locked: p.locked,
        objects: objects,
        connections: connections,
        objectCount: objects.length,
      },
    };
  } catch (e) {
    return { error: 'patcher.snapshot failed: ' + e.message };
  }
};

/**
 * patcher.save — パッチ保存
 */
handlers['patcher.save'] = function(params) {
  try {
    var p = getTargetPatcher.call(this);
    p.message('save');
    return {
      saved: true,
      path: p.filepath || p.name,
    };
  } catch (e) {
    return { error: 'patcher.save failed: ' + e.message };
  }
};

/**
 * audio.status — DSP 状態取得
 */
handlers['audio.status'] = function(params) {
  try {
    var dspState = max.isAudioOn ? max.isAudioOn() : undefined;
    return {
      dsp: dspState ? 'on' : 'off',
      sampleRate: 44100,   // デフォルト値、実際には Max API から取得
      vectorSize: 512,
      cpuLoad: 0,
      message: 'DSP status retrieved',
    };
  } catch (e) {
    return { error: 'audio.status failed: ' + e.message };
  }
};

// --- オブジェクト検索ヘルパー ---

/**
 * ID またはスクリプティング名でオブジェクトを検索
 */
function findObject(idOrName) {
  if (!idOrName) return null;

  var p = getTargetPatcher.call(this);

  // まず varname (スクリプティング名) で検索
  var found = null;
  try {
    found = p.getnamed(idOrName);
    if (found) return found;
  } catch (e) {
    // getnamed が使えない場合はフォールバック
  }

  // apply で全オブジェクトを走査
  p.apply(function(obj) {
    if (obj.varname === idOrName || String(obj) === idOrName) {
      found = obj;
    }
  });
  return found;
}

// --- メッセージ受信 ---

/**
 * inlet 0 からのメッセージ受信
 * フォーマット: commandId action paramsJson
 */
function anything() {
  var args = arrayfromargs(messagename, arguments);

  if (args.length < 3) {
    post('MaxMCP patcher-api: Invalid command format\n');
    return;
  }

  var commandId = args[0];
  var action = args[1];
  var paramsJson = args.slice(2).join(' ');

  var params;
  try {
    params = JSON.parse(paramsJson);
  } catch (e) {
    sendError(commandId, 'Invalid params JSON: ' + e.message);
    return;
  }

  // ハンドラー実行
  var handler = handlers[action];
  if (!handler) {
    sendError(commandId, 'Unknown action: ' + action);
    return;
  }

  try {
    var result = handler.call(this, params);
    sendResult(commandId, result);
  } catch (e) {
    sendError(commandId, 'Handler error: ' + e.message);
  }
}

// --- レスポンス送信 ---

function sendResult(commandId, result) {
  // outlet でレスポンスを返す（node.script が受信）
  outlet(0, 'response', commandId, JSON.stringify(result));
}

function sendError(commandId, errorMessage) {
  outlet(0, 'error', commandId, errorMessage);
}

// --- ログ蓄積 ---

/**
 * 外部からログを追加（Max パッチ内の print 等を監視）
 */
function addLog(msg) {
  var timestamp = new Date().toISOString();
  logBuffer.push(timestamp + ' ' + msg);
  if (logBuffer.length > MAX_LOG_LINES) {
    logBuffer.shift();
  }
}

// ログを追加するための inlet メッセージ
handlers['log.add'] = function(params) {
  addLog(params.message || '');
  return { added: true };
};

// --- RNBO 関連ハンドラー ---

/**
 * rnbo.export — RNBO ターゲットへエクスポート
 * rnbo~ オブジェクトのメッセージインターフェースを使用
 */
handlers['rnbo.export'] = function(params) {
  var target = params.target || 'cpp';
  var outputDir = params.outputDir || '';
  var name = params.name || '';

  try {
    // パッチ内の rnbo~ オブジェクトを検索
    var p = getTargetPatcher.call(this);
    var rnboObj = null;
    p.apply(function(obj) {
      if (obj.maxclass === 'rnbo~') {
        rnboObj = obj;
      }
    });

    if (!rnboObj) {
      return {
        status: 'error',
        message: 'rnbo~ オブジェクトがパッチ内に見つかりません',
      };
    }

    // rnbo~ にエクスポートメッセージを送信
    // target: vst3, au, web, rpi, cpp
    var exportArgs = ['export', target];
    if (outputDir) {
      exportArgs.push('output', outputDir);
    }
    if (name) {
      exportArgs.push('name', name);
    }

    rnboObj.message.apply(rnboObj, exportArgs);

    return {
      status: 'ok',
      message: 'RNBO エクスポートを開始しました',
      target: target,
      outputDir: outputDir || '(default)',
      name: name || '(auto)',
    };
  } catch (e) {
    return {
      status: 'error',
      message: 'RNBO export failed: ' + e.message,
    };
  }
};

// --- Phase 3: レイアウト / モード / ログ拡張 ---

/**
 * patcher.align — オブジェクトの整列
 */
handlers['patcher.align'] = function(params) {
  var ids = params.ids || [];
  var direction = params.direction || 'left';

  if (ids.length < 2) {
    return { error: '整列には2つ以上のオブジェクトが必要です' };
  }

  try {
    var p = getTargetPatcher.call(this);
    var objects = [];
    for (var i = 0; i < ids.length; i++) {
      var obj = p.getnamed(ids[i]);
      if (obj) {
        objects.push(obj);
      }
    }

    if (objects.length < 2) {
      return { error: '有効なオブジェクトが2つ未満です' };
    }

    var rect0 = objects[0].rect;
    var refValue;

    switch (direction) {
      case 'left':
        refValue = rect0[0];
        for (var i = 1; i < objects.length; i++) {
          var r = objects[i].rect;
          objects[i].rect = [refValue, r[1], refValue + (r[2] - r[0]), r[3]];
        }
        break;
      case 'right':
        refValue = rect0[2];
        for (var i = 1; i < objects.length; i++) {
          var r = objects[i].rect;
          var w = r[2] - r[0];
          objects[i].rect = [refValue - w, r[1], refValue, r[3]];
        }
        break;
      case 'top':
        refValue = rect0[1];
        for (var i = 1; i < objects.length; i++) {
          var r = objects[i].rect;
          objects[i].rect = [r[0], refValue, r[2], refValue + (r[3] - r[1])];
        }
        break;
      case 'bottom':
        refValue = rect0[3];
        for (var i = 1; i < objects.length; i++) {
          var r = objects[i].rect;
          var h = r[3] - r[1];
          objects[i].rect = [r[0], refValue - h, r[2], refValue];
        }
        break;
      case 'vcenter':
        refValue = (rect0[1] + rect0[3]) / 2;
        for (var i = 1; i < objects.length; i++) {
          var r = objects[i].rect;
          var h = r[3] - r[1];
          objects[i].rect = [r[0], refValue - h / 2, r[2], refValue + h / 2];
        }
        break;
      case 'hcenter':
        refValue = (rect0[0] + rect0[2]) / 2;
        for (var i = 1; i < objects.length; i++) {
          var r = objects[i].rect;
          var w = r[2] - r[0];
          objects[i].rect = [refValue - w / 2, r[1], refValue + w / 2, r[3]];
        }
        break;
    }

    return {
      aligned: objects.length,
      direction: direction,
      message: objects.length + ' 個のオブジェクトを ' + direction + ' に整列しました',
    };
  } catch (e) {
    return { error: 'Align failed: ' + e.message };
  }
};

/**
 * patcher.distribute — オブジェクトの均等配置
 */
handlers['patcher.distribute'] = function(params) {
  var ids = params.ids || [];
  var direction = params.direction || 'horizontal';
  var spacing = params.spacing;

  if (ids.length < 2) {
    return { error: '均等配置には2つ以上のオブジェクトが必要です' };
  }

  try {
    var p = getTargetPatcher.call(this);
    var objects = [];
    for (var i = 0; i < ids.length; i++) {
      var obj = p.getnamed(ids[i]);
      if (obj) {
        objects.push(obj);
      }
    }

    if (objects.length < 2) {
      return { error: '有効なオブジェクトが2つ未満です' };
    }

    if (direction === 'horizontal') {
      objects.sort(function(a, b) { return a.rect[0] - b.rect[0]; });
      if (spacing === undefined) {
        var totalSpan = objects[objects.length - 1].rect[0] - objects[0].rect[0];
        spacing = totalSpan / (objects.length - 1);
      }
      var startX = objects[0].rect[0];
      for (var i = 1; i < objects.length; i++) {
        var r = objects[i].rect;
        var w = r[2] - r[0];
        var newX = startX + spacing * i;
        objects[i].rect = [newX, r[1], newX + w, r[3]];
      }
    } else {
      objects.sort(function(a, b) { return a.rect[1] - b.rect[1]; });
      if (spacing === undefined) {
        var totalSpan = objects[objects.length - 1].rect[1] - objects[0].rect[1];
        spacing = totalSpan / (objects.length - 1);
      }
      var startY = objects[0].rect[1];
      for (var i = 1; i < objects.length; i++) {
        var r = objects[i].rect;
        var h = r[3] - r[1];
        var newY = startY + spacing * i;
        objects[i].rect = [r[0], newY, r[2], newY + h];
      }
    }

    return {
      distributed: objects.length,
      direction: direction,
      spacing: spacing,
      message: objects.length + ' 個のオブジェクトを ' + direction + ' に均等配置しました',
    };
  } catch (e) {
    return { error: 'Distribute failed: ' + e.message };
  }
};

/**
 * patcher.cleanup — パッチ全体の自動整理
 */
handlers['patcher.cleanup'] = function(params) {
  try {
    var p = getTargetPatcher.call(this);
    var gridSize = 15;
    var count = 0;
    var obj = p.firstobject;

    while (obj) {
      var r = obj.rect;
      var snappedX = Math.round(r[0] / gridSize) * gridSize;
      var snappedY = Math.round(r[1] / gridSize) * gridSize;
      var w = r[2] - r[0];
      var h = r[3] - r[1];
      obj.rect = [snappedX, snappedY, snappedX + w, snappedY + h];
      count++;
      obj = obj.nextobject;
    }

    return {
      cleaned: true,
      objectsMoved: count,
      gridSize: gridSize,
      message: count + ' 個のオブジェクトをグリッドにスナップしました',
    };
  } catch (e) {
    return { error: 'Cleanup failed: ' + e.message };
  }
};

/**
 * patcher.unlock — パッチのアンロック
 */
handlers['patcher.unlock'] = function(params) {
  try {
    var p = getTargetPatcher.call(this);
    p.locked = false;
  } catch (e) {
    return { error: 'Unlock failed: ' + e.message };
  }

  return {
    locked: false,
    message: 'パッチをアンロックしました',
  };
};

/**
 * patcher.presentation — プレゼンテーションモード切替
 */
handlers['patcher.presentation'] = function(params) {
  var enable = params.enable;
  var p = getTargetPatcher.call(this);

  try {
    if (enable !== undefined) {
      p.presentation = enable;
    } else {
      p.presentation = !p.presentation;
    }
  } catch (e) {
    return { error: 'Presentation toggle failed: ' + e.message };
  }

  return {
    presentation: p.presentation,
    message: 'プレゼンテーションモード ' + (p.presentation ? 'ON' : 'OFF'),
  };
};

/**
 * log.search — ログの正規表現検索
 */
handlers['log.search'] = function(params) {
  var pattern = params.pattern || '';
  var lines = params.lines || 100;

  try {
    var searchTarget = logBuffer.slice(-lines);
    var regex = new RegExp(pattern, 'i');
    var matches = [];

    for (var i = 0; i < searchTarget.length; i++) {
      if (regex.test(searchTarget[i])) {
        matches.push(searchTarget[i]);
      }
    }

    return {
      matches: matches,
      total: matches.length,
      searched: searchTarget.length,
      pattern: pattern,
    };
  } catch (e) {
    return { error: 'Log search failed: ' + e.message };
  }
};

/**
 * log.clear — ログバッファのクリア
 */
handlers['log.clear'] = function(params) {
  var count = logBuffer.length;
  logBuffer = [];
  return {
    cleared: true,
    linesCleared: count,
    message: 'ログをクリアしました（' + count + ' 行）',
  };
};

post('MaxMCP patcher-api.js loaded\n');
