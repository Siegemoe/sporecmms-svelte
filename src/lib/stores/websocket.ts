import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// --- Types ---
interface RealTimeMessage {
	type: 'WO_UPDATE' | 'WO_ASSIGNMENT' | 'WO_NEW' | 'CONNECTED';
	payload: unknown;
	timestamp: number;
}

interface WebSocketState {
	isConnected: boolean;
	messages: RealTimeMessage[];
	error: string | null;
	orgId: string | null;
	isPolling: boolean;
}

// --- Store ---
const initialState: WebSocketState = {
	isConnected: false,
	messages: [],
	error: null,
	orgId: null,
	isPolling: false
};

export const wsStore = writable<WebSocketState>(initialState);

// --- Connection Logic ---
let ws: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let pollingInterval: ReturnType<typeof setInterval> | null = null;
let lastPollTimestamp = 0;

const RECONNECT_INTERVAL = 3000;
const POLLING_INTERVAL = 10000; // 10 seconds

function getWsUrl(): string {
	if (!browser) return '';

	const host = window.location.hostname;
	const port = window.location.port;

	// In dev mode (Vite on 5173-5175), WS runs on separate port 3001
	// In production, WS runs on same port via /ws path
	const isDev = port === '5173' || port === '5174' || port === '5175' || port === '5176';

	if (isDev) {
		console.log('[WS] Dev mode detected, using port 3001');
		return `ws://${host}:3001`;
	} else {
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		return `${protocol}//${window.location.host}/ws`;
	}
}

// --- Polling Fallback ---
async function startPolling() {
	if (pollingInterval) return;

	console.log('[WS] Starting polling fallback');
	wsStore.update(state => ({ ...state, isPolling: true }));

	pollingInterval = setInterval(async () => {
		try {
			const response = await fetch('/api/activity');
			if (response.ok) {
				const data = await response.json();

				// Process new activity since last poll
				if (data.activities && Array.isArray(data.activities)) {
					const newMessages = data.activities
						.filter((activity: any) => activity.timestamp > lastPollTimestamp)
						.map((activity: any) => ({
							type: activity.type,
							payload: activity.payload,
							timestamp: activity.timestamp
						}));

					if (newMessages.length > 0) {
						lastPollTimestamp = Math.max(...newMessages.map(m => m.timestamp));

						wsStore.update(state => ({
							...state,
							messages: [...newMessages, ...state.messages].slice(0, 100)
						}));

						console.log('[WS] Polling received updates:', newMessages.length);
					}
				}
			}
		} catch (error) {
			console.error('[WS] Polling error:', error);
			// Don't update store on polling error, just log it
		}
	}, POLLING_INTERVAL);
}

function stopPolling() {
	if (pollingInterval) {
		clearInterval(pollingInterval);
		pollingInterval = null;
		console.log('[WS] Stopped polling fallback');
		wsStore.update(state => ({ ...state, isPolling: false }));
	}
}

function connect() {
	if (!browser || ws) return;

	const url = getWsUrl();
	console.log(`[WS] Connecting to ${url}...`);

	try {
		ws = new WebSocket(url);
	} catch (e) {
		console.error('[WS] Failed to create WebSocket:', e);
		// Start polling as fallback immediately
		startPolling();
		return;
	}

	ws.onopen = () => {
		wsStore.update(state => ({ ...state, isConnected: true, error: null }));
		console.log('[WS] Connected successfully');
		// Stop polling when WebSocket connects
		stopPolling();
	};

	ws.onmessage = (event) => {
		try {
			const data = JSON.parse(event.data);
			const message: RealTimeMessage = {
				...data,
				timestamp: Date.now()
			};

			// Handle connection confirmation
			if (message.type === 'CONNECTED') {
				wsStore.update(state => ({
					...state,
					orgId: (message.payload as { orgId: string }).orgId
				}));
				console.log('[WS] Confirmed org:', (message.payload as { orgId: string }).orgId);
				return;
			}

			// Add other messages to the store
			wsStore.update(state => ({
				...state,
				messages: [message, ...state.messages].slice(0, 100) // Keep last 100
			}));

			console.log('[WS] Received:', message.type);
		} catch (e) {
			console.error('[WS] Error parsing message:', e);
		}
	};

	ws.onerror = (e) => {
		console.error('[WS] Error:', e);
		wsStore.update(state => ({ ...state, error: 'Connection error' }));
	};

	ws.onclose = (e) => {
		console.log('[WS] Disconnected, code:', e.code);
		wsStore.update(state => ({ ...state, isConnected: false }));
		ws = null;

		// If connection fails, start polling as fallback
		if (e.code !== 1000) { // Not a normal closure
			setTimeout(() => {
				if (!ws) { // Only start polling if not already reconnecting via WebSocket
					startPolling();
				}
				scheduleReconnect();
			}, 2000); // Shorter delay before trying fallback
		}
	};
}

function scheduleReconnect() {
	if (reconnectTimeout) return;

	console.log(`[WS] Reconnecting in ${RECONNECT_INTERVAL / 1000}s...`);
	reconnectTimeout = setTimeout(() => {
		reconnectTimeout = null;
		connect();
	}, RECONNECT_INTERVAL);
}

// --- Exports ---
export function initializeWebSocket() {
	if (browser) {
		// Set initial poll timestamp
		lastPollTimestamp = Date.now();
		connect();
	}
}

export function disconnectWebSocket() {
	if (reconnectTimeout) {
		clearTimeout(reconnectTimeout);
		reconnectTimeout = null;
	}
	if (ws) {
		ws.close();
		ws = null;
	}
	stopPolling();
}

// Helper to check if we should reconnect (e.g., after auth)
export function reconnectWebSocket() {
	disconnectWebSocket();
	connect();
}

// Helper to get current connection status
export function getConnectionStatus() {
	let status = { isConnected: false, isPolling: false, method: 'none' };
	wsStore.subscribe(state => {
		status = {
			isConnected: state.isConnected,
			isPolling: state.isPolling,
			method: state.isConnected ? 'websocket' : state.isPolling ? 'polling' : 'none'
		};
	})();
	return status;
}
