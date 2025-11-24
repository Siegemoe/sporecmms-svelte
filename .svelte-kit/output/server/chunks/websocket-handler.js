const DEV_BROADCAST_URL = "http://localhost:3001/api/broadcast";
async function broadcastToOrg(orgId, message) {
  try {
    const response = await fetch(DEV_BROADCAST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, message })
    });
    if (response.ok) {
      console.log("[WS] Broadcast sent via HTTP API");
      return;
    }
  } catch (e) {
  }
  if (typeof globalThis.__wsBroadcast === "function") {
    globalThis.__wsBroadcast(orgId, message);
    console.log("[WS] Broadcast sent via global function");
  } else {
    console.warn("[WS] Broadcast not available");
  }
}
export {
  broadcastToOrg as b
};
