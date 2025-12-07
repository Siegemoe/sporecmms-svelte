// Development server with WebSocket support
// This runs Vite's dev server AND a WebSocket server side-by-side

import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { parse } from 'cookie';
import { spawn } from 'child_process';
const prismaPromise = (async () => {
  const { createNodePrismaClient } = await import('./src/lib/server/prisma.js');
  return createNodePrismaClient();
})();

// --- WebSocket Setup ---
const wss = new WebSocketServer({ noServer: true });
const orgs = new Map();

function getOrgSockets(orgId) {
	if (!orgs.has(orgId)) {
		orgs.set(orgId, new Set());
	}
	return orgs.get(orgId);
}

function broadcastToOrg(orgId, message) {
	const orgSockets = orgs.get(orgId);
	if (orgSockets) {
		const data = JSON.stringify(message);
		console.log(`[WS Dev] Broadcasting to org ${orgId}:`, message.type);
		for (const client of orgSockets) {
			if (client.readyState === 1) {
				client.send(data);
			}
		}
	} else {
		console.log(`[WS Dev] No clients for org ${orgId}`);
	}
}

// Real session validation for dev
async function validateSessionFromCookies(cookieHeader) {
	if (!cookieHeader) return null;
	
	const cookies = parse(cookieHeader);
	const sessionId = cookies.spore_session;
	
	if (!sessionId) return null;
	
	try {
		const prisma = await prismaPromise;
		const session = await prisma.session.findUnique({
			where: { id: sessionId },
			include: {
				user: {
					select: { id: true, orgId: true }
				}
			}
		});
		
		if (!session || session.expiresAt < new Date()) {
			return null;
		}
		
		return { orgId: session.user.orgId, userId: session.user.id };
	} catch (e) {
		console.error('[WS Dev] Session validation error:', e);
		return null;
	}
}

wss.on('connection', async (ws, req) => {
	const session = await validateSessionFromCookies(req.headers.cookie);
	
	if (!session) {
		console.log('[WS Dev] No valid session, closing connection');
		ws.close();
		return;
	}
	
	const { orgId } = session;
	
	console.log(`[WS Dev] Client connected | org: ${orgId}`);
	
	const orgSockets = getOrgSockets(orgId);
	orgSockets.add(ws);

	ws.send(JSON.stringify({ 
		type: 'CONNECTED', 
		payload: { orgId } 
	}));

	ws.on('close', () => {
		console.log(`[WS Dev] Client disconnected | org: ${orgId}`);
		orgSockets.delete(ws);
	});
});

// --- HTTP Server for broadcast API + WebSocket upgrades ---
const server = createServer((req, res) => {
	// Handle broadcast API endpoint
	if (req.method === 'POST' && req.url === '/api/broadcast') {
		let body = '';
		req.on('data', chunk => { body += chunk; });
		req.on('end', () => {
			try {
				const { orgId, message } = JSON.parse(body);
				broadcastToOrg(orgId, message);
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ success: true }));
			} catch (e) {
				res.writeHead(400);
				res.end('Invalid JSON');
			}
		});
		return;
	}
	
	// Default response
	res.writeHead(404);
	res.end('Not found');
});

// Handle WebSocket upgrades
server.on('upgrade', (req, socket, head) => {
	wss.handleUpgrade(req, socket, head, (ws) => {
		wss.emit('connection', ws, req);
	});
});

server.listen(3001, () => {
	console.log(`
╔═══════════════════════════════════════════╗
║  WebSocket Dev Server running on :3001    ║
║  Broadcast API: POST /api/broadcast       ║
╚═══════════════════════════════════════════╝
`);
});

// Start Vite dev server
const vite = spawn('npx', ['vite', 'dev'], { 
	stdio: 'inherit',
	shell: true 
});

vite.on('close', (code) => {
	console.log('Vite exited, shutting down...');
	server.close();
	process.exit(code);
});
