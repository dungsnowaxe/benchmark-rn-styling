/**
 * Loads RN's React renderer immediately so `RCTEventEmitter.register` runs
 * before navigation / native views can call `receiveEvent` (debug 121416).
 */
require("react-native/Libraries/Renderer/shims/ReactNative");

// #region agent log
fetch("http://127.0.0.1:7515/ingest/4838cb07-8a72-4146-a32f-c2a545694663", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Debug-Session-Id": "121416",
  },
  body: JSON.stringify({
    sessionId: "121416",
    runId: "renderer-preload",
    location: "ensureReactNativeRenderer.ts:after-shim",
    message: "react_native_renderer_shim_loaded",
    data: {},
    timestamp: Date.now(),
    hypothesisId: "H8",
  }),
}).catch(() => {});
// #endregion
