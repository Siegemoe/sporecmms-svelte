// Custom server entry point for SvelteKit + WebSockets
// Run with: node server.js (after building with `npm run build`)

import { createServer } from 'http';
import { handler } from './build/handler.js';
import { WebSocketServer } from 'ws';
import { parse } from 'cookie';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// --- WebSocket Setup ---
const wss = new WebSocketServer({ noServer: true });

// Map to store clients by their organization ID
const orgs = new Map();

function getOrgSockets(orgId) {
	if (!orgs.has(orgId)) {
		orgs.set(orgId, new Set());
	}
	return orgs.get(orgId);
}

// Broadcast to all clients in an org
export function broadcastToOrg(orgId, message) {
	const orgSockets = orgs.get(orgId);
	if (orgSockets) {
		const data = JSON.stringify(message);
		for (const client of orgSockets) {
			if (client.readyState === 1) { // WebSocket.OPEN
				client.send(data);
			}
		}
	}
}

// Make broadcast available globally for imports
globalThis.__wsBroadcast = broadcastToOrg;

// --- Session Validation ---
const prismaPromise = (async () => {
  const { createNodePrismaClient } = await import('./src/lib/server/prisma.js');
  return createNodePrismaClient();
})();

async function validateSessionFromCookies(cookieHeader) {
	if (!cookieHeader) return null;

	const cookies = parse(cookieHeader);
	const sessionId = cookies['spore_session'];

	if (!sessionId) return null;

	try {
		const prisma = await prismaPromise;
		const session = await prisma.session.findUnique({
			where: { id: sessionId },
			include: {
				user: {
					select: {
						id: true,
						organizationId: true
					}
				}
			}
		});

		if (!session || session.expiresAt < new Date()) {
			return null;
		}

		return {
			orgId: session.user.organizationId,
			userId: session.user.id
		};
	} catch (e) {
		console.error('Session validation error:', e);
		return null;
	}
}

// --- WebSocket Connection Handler ---
wss.on('connection', (ws, req, session) => {
	const { orgId } = session;
	console.log(`[WS] Client connected | org: ${orgId}`);
	
	const orgSockets = getOrgSockets(orgId);
	orgSockets.add(ws);

	// Send confirmation to client
	ws.send(JSON.stringify({ 
		type: 'CONNECTED', 
		payload: { orgId } 
	}));

	ws.on('message', (data) => {
		// Handle incoming messages from client if needed
		console.log(`[WS] Message from ${orgId}:`, data.toString());
	});

	ws.on('close', () => {
		console.log(`[WS] Client disconnected | org: ${orgId}`);
		orgSockets.delete(ws);
	});

	ws.on('error', (err) => {
		console.error(`[WS] Error for org ${orgId}:`, err);
		orgSockets.delete(ws);
	});
});

// --- HTTP Server Setup ---
const server = createServer((req, res) => {
	// Let SvelteKit handle all HTTP requests
	handler(req, res);
});

// --- WebSocket Upgrade Handler ---
server.on('upgrade', (req, socket, head) => {
	// Only handle upgrades to /ws path
	const url = new URL(req.url, `http://${req.headers.host}`);
	
	if (url.pathname !== '/ws') {
		socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
		socket.destroy();
		return;
	}

	// Validate session from cookies
	validateSessionFromCookies(req.headers.cookie).then(session => {
		if (!session) {
			console.log('[WS] Unauthorized upgrade attempt');
			socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
			socket.destroy();
			return;
		}

		wss.handleUpgrade(req, socket, head, (ws) => {
			wss.emit('connection', ws, req, session);
		});
	}).catch(err => {
		console.error('[WS] Session validation failed:', err);
		socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
		socket.destroy();
	});
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
	console.log(`
╔═══════════════════════════════════════════╗
║  Spore CMMS Server                        ║
║  HTTP + WebSocket running on port ${PORT}    ║
╚═══════════════════════════════════════════╝
	`);
});
