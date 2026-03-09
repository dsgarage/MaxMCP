{
	"patcher" : 	{
		"fileversion" : 1,
		"appversion" : 		{
			"major" : 9,
			"minor" : 1,
			"revision" : 2,
			"architecture" : "x64",
			"modernui" : 1
		},
		"classnamespace" : "box",
		"rect" : [ 100.0, 100.0, 750.0, 550.0 ],
		"gridsize" : [ 15.0, 15.0 ],
		"boxes" : [
			{
				"box" : 				{
					"maxclass" : "comment",
					"text" : "MaxMCP Client v1.0.0",
					"id" : "obj-title",
					"fontsize" : 18.0,
					"fontface" : 1,
					"patching_rect" : [ 30.0, 15.0, 250.0, 27.0 ],
					"numinlets" : 1,
					"numoutlets" : 0
				}
			},
			{
				"box" : 				{
					"maxclass" : "comment",
					"text" : "初回: npm install → connect",
					"id" : "obj-step1",
					"fontsize" : 11.0,
					"textcolor" : [ 0.7, 0.7, 0.7, 1.0 ],
					"patching_rect" : [ 30.0, 48.0, 200.0, 20.0 ],
					"numinlets" : 1,
					"numoutlets" : 0
				}
			},
			{
				"box" : 				{
					"maxclass" : "button",
					"id" : "obj-npm-btn",
					"patching_rect" : [ 30.0, 75.0, 24.0, 24.0 ],
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ]
				}
			},
			{
				"box" : 				{
					"maxclass" : "message",
					"text" : "script npm install",
					"id" : "obj-npm-msg",
					"patching_rect" : [ 60.0, 75.0, 115.0, 22.0 ],
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ]
				}
			},
			{
				"box" : 				{
					"maxclass" : "comment",
					"text" : "← 初回のみ",
					"id" : "obj-npm-hint",
					"fontsize" : 10.0,
					"textcolor" : [ 0.6, 0.6, 0.4, 1.0 ],
					"patching_rect" : [ 180.0, 77.0, 80.0, 18.0 ],
					"numinlets" : 1,
					"numoutlets" : 0
				}
			},
			{
				"box" : 				{
					"maxclass" : "button",
					"id" : "obj-start-btn",
					"patching_rect" : [ 30.0, 110.0, 24.0, 24.0 ],
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ]
				}
			},
			{
				"box" : 				{
					"maxclass" : "message",
					"text" : "script start",
					"id" : "obj-start-msg",
					"patching_rect" : [ 60.0, 110.0, 75.0, 22.0 ],
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ]
				}
			},
			{
				"box" : 				{
					"maxclass" : "button",
					"id" : "obj-connect-btn",
					"patching_rect" : [ 30.0, 145.0, 24.0, 24.0 ],
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ]
				}
			},
			{
				"box" : 				{
					"maxclass" : "message",
					"text" : "connect localhost 8080",
					"id" : "obj-connect-msg",
					"patching_rect" : [ 60.0, 145.0, 145.0, 22.0 ],
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ]
				}
			},
			{
				"box" : 				{
					"maxclass" : "button",
					"id" : "obj-disconnect-btn",
					"patching_rect" : [ 225.0, 145.0, 24.0, 24.0 ],
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ]
				}
			},
			{
				"box" : 				{
					"maxclass" : "message",
					"text" : "disconnect",
					"id" : "obj-disconnect-msg",
					"patching_rect" : [ 255.0, 145.0, 68.0, 22.0 ],
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ]
				}
			},
			{
				"box" : 				{
					"maxclass" : "comment",
					"text" : "Status:",
					"id" : "obj-status-label",
					"patching_rect" : [ 375.0, 145.0, 50.0, 20.0 ],
					"numinlets" : 1,
					"numoutlets" : 0
				}
			},
			{
				"box" : 				{
					"maxclass" : "message",
					"text" : "not started",
					"id" : "obj-status",
					"varname" : "status_display",
					"patching_rect" : [ 430.0, 145.0, 120.0, 22.0 ],
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ]
				}
			},
			{
				"box" : 				{
					"maxclass" : "newobj",
					"text" : "node.script ws-bridge.js",
					"id" : "obj-ws-bridge",
					"varname" : "ws_bridge",
					"patching_rect" : [ 30.0, 195.0, 155.0, 22.0 ],
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"autostart" : 1
				}
			},
			{
				"box" : 				{
					"maxclass" : "newobj",
					"text" : "route command status info",
					"id" : "obj-route",
					"patching_rect" : [ 30.0, 240.0, 170.0, 22.0 ],
					"numinlets" : 1,
					"numoutlets" : 4,
					"outlettype" : [ "", "", "", "" ]
				}
			},
			{
				"box" : 				{
					"maxclass" : "newobj",
					"text" : "prepend set",
					"id" : "obj-status-prepend",
					"patching_rect" : [ 120.0, 270.0, 74.0, 22.0 ],
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ]
				}
			},
			{
				"box" : 				{
					"maxclass" : "newobj",
					"text" : "print MaxMCP",
					"id" : "obj-print",
					"patching_rect" : [ 240.0, 270.0, 85.0, 22.0 ],
					"numinlets" : 1,
					"numoutlets" : 0
				}
			},
			{
				"box" : 				{
					"maxclass" : "comment",
					"text" : "command → v8 (patcher-api.js)",
					"id" : "obj-cmd-comment",
					"fontsize" : 10.0,
					"textcolor" : [ 0.5, 0.5, 0.5, 1.0 ],
					"patching_rect" : [ 30.0, 300.0, 180.0, 18.0 ],
					"numinlets" : 1,
					"numoutlets" : 0
				}
			},
			{
				"box" : 				{
					"maxclass" : "js",
					"text" : "js patcher-api.js",
					"id" : "obj-patcher-api",
					"varname" : "patcher_api",
					"patching_rect" : [ 30.0, 325.0, 120.0, 22.0 ],
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"filename" : "patcher-api.js"
				}
			},
			{
				"box" : 				{
					"maxclass" : "newobj",
					"text" : "route response error",
					"id" : "obj-response-route",
					"patching_rect" : [ 30.0, 365.0, 130.0, 22.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "" ]
				}
			},
			{
				"box" : 				{
					"maxclass" : "message",
					"text" : "response $1 $2",
					"id" : "obj-response-msg",
					"patching_rect" : [ 30.0, 405.0, 95.0, 22.0 ],
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ]
				}
			},
			{
				"box" : 				{
					"maxclass" : "message",
					"text" : "error $1 $2",
					"id" : "obj-error-msg",
					"patching_rect" : [ 135.0, 405.0, 75.0, 22.0 ],
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ]
				}
			},
			{
				"box" : 				{
					"maxclass" : "comment",
					"text" : "response/error → node.script → Server",
					"id" : "obj-resp-comment",
					"fontsize" : 10.0,
					"textcolor" : [ 0.5, 0.5, 0.5, 1.0 ],
					"patching_rect" : [ 30.0, 435.0, 220.0, 18.0 ],
					"numinlets" : 1,
					"numoutlets" : 0
				}
			}
		],
		"lines" : [
			{
				"patchline" : 				{
					"source" : [ "obj-npm-btn", 0 ],
					"destination" : [ "obj-npm-msg", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-npm-msg", 0 ],
					"destination" : [ "obj-ws-bridge", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-start-btn", 0 ],
					"destination" : [ "obj-start-msg", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-start-msg", 0 ],
					"destination" : [ "obj-ws-bridge", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-connect-btn", 0 ],
					"destination" : [ "obj-connect-msg", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-connect-msg", 0 ],
					"destination" : [ "obj-ws-bridge", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-disconnect-btn", 0 ],
					"destination" : [ "obj-disconnect-msg", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-disconnect-msg", 0 ],
					"destination" : [ "obj-ws-bridge", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-ws-bridge", 0 ],
					"destination" : [ "obj-route", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-route", 0 ],
					"destination" : [ "obj-patcher-api", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-route", 1 ],
					"destination" : [ "obj-status-prepend", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-route", 2 ],
					"destination" : [ "obj-print", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-status-prepend", 0 ],
					"destination" : [ "obj-status", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-patcher-api", 0 ],
					"destination" : [ "obj-response-route", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-response-route", 0 ],
					"destination" : [ "obj-response-msg", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-response-route", 1 ],
					"destination" : [ "obj-error-msg", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-response-msg", 0 ],
					"destination" : [ "obj-ws-bridge", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-error-msg", 0 ],
					"destination" : [ "obj-ws-bridge", 0 ]
				}
			}
		]
	}
}
