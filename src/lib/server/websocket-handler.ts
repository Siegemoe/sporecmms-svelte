// Broadcast a message to all WebSocket clients in an organization
// In dev: calls HTTP endpoint on dev server
// In prod: calls global function set by server.js

const DEV_BROADCAST_URL = 'http://localhost:3001/api/broadcast';

export async function broadcastToOrg(orgId: string, message: { type: string; payload: unknown }) {
	// Try the HTTP endpoint first (works in dev)
	try {
		const response = await fetch(DEV_BROADCAST_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ orgId, message })
		});
		
		if (response.ok) {
			console.log('[WS] Broadcast sent via HTTP API');
			return;
		}
	} catch (e) {
		// HTTP endpoint not available, try global function
	}
	
	// Fall back to global function (production with custom server)
	if (typeof globalThis.__wsBroadcast === 'function') {
		globalThis.__wsBroadcast(orgId, message);
		console.log('[WS] Broadcast sent via global function');
	} else {
		console.warn('[WS] Broadcast not available');
	}
}

// Type declaration for the global broadcast function (production)
declare global {
	var __wsBroadcast: ((orgId: string, message: unknown) => void) | undefined;
}
