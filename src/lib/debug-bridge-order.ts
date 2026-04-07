// Debug session: bridge / RCTEventEmitter init order (session 121416)

// #region agent log
fetch("http://127.0.0.1:7515/ingest/4838cb07-8a72-4146-a32f-c2a545694663", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Debug-Session-Id": "121416",
  },
  body: JSON.stringify({
    sessionId: "121416",
    runId: "pre-fix",
    location: "debug-bridge-order.ts:post-metro-runtime",
    message: "after_metro_runtime_before_unistyles",
    data: { phase: "init" },
    timestamp: Date.now(),
    hypothesisId: "H1",
  }),
}).catch(() => {});
// #endregion

const g = globalThis as {
  ErrorUtils?: {
    getGlobalHandler?: () => (e: unknown, isFatal?: boolean) => void;
    setGlobalHandler?: (fn: (e: unknown, isFatal?: boolean) => void) => void;
  };
};

const EU = g.ErrorUtils;
if (EU?.getGlobalHandler && EU?.setGlobalHandler) {
  const prev = EU.getGlobalHandler();
  EU.setGlobalHandler((error: unknown, isFatal?: boolean) => {
    // #region agent log
    const msg =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : String(error);
    fetch("http://127.0.0.1:7515/ingest/4838cb07-8a72-4146-a32f-c2a545694663", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "121416",
      },
      body: JSON.stringify({
        sessionId: "121416",
        runId: "pre-fix",
        location: "debug-bridge-order.ts:global-handler",
        message: "global_js_error",
        data: {
          errSnippet: msg.slice(0, 220),
          isFatal: Boolean(isFatal),
          isRctEmitter: msg.includes("RCTEventEmitter"),
        },
        timestamp: Date.now(),
        hypothesisId: "H5",
      }),
    }).catch(() => {});
    // #endregion
    prev(error, isFatal);
  });
}
