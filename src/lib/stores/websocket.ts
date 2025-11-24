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
}

// --- Store ---
const initialState: WebSocketState = {
	isConnected: false,
	messages: [],
	error: null,
	orgId: null
};

export const wsStore = writable<WebSocketState>(initialState);

// --- Connection Logic ---
let ws: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
const RECONNECT_INTERVAL = 3000;

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

function connect() {
	if (!browser || ws) return;

	const url = getWsUrl();
	console.log(`[WS] Connecting to ${url}...`);
	
	try {
		ws = new WebSocket(url);
	} catch (e) {
		console.error('[WS] Failed to create WebSocket:', e);
		scheduleReconnect();
		return;
	}

	ws.onopen = () => {
		wsStore.update(state => ({ ...state, isConnected: true, error: null }));
		console.log('[WS] Connected successfully');
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
		scheduleReconnect();
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
}

// Helper to check if we should reconnect (e.g., after auth)
export function reconnectWebSocket() {
	disconnectWebSocket();
	connect();
}
