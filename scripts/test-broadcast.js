// Test script to simulate a real-time work order update
// Run with: node scripts/test-broadcast.js

import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
	console.log('Connected to WebSocket server');
});

ws.on('message', (data) => {
	const message = JSON.parse(data.toString());
	console.log('Received:', message);
	
	if (message.type === 'CONNECTED') {
		console.log('\\n✅ Connected to org:', message.payload.orgId);
		console.log('\\nWatching for real-time updates...');
		console.log('Change a work order status in the UI to see it here.\\n');
	}
	
	if (message.type === 'WO_UPDATE') {
		console.log('\\n🔔 REAL-TIME UPDATE RECEIVED!');
		console.log('   Work Order:', message.payload.title);
		console.log('   New Status:', message.payload.status);
	}
});

ws.on('close', () => {
	console.log('Disconnected');
});

ws.on('error', (err) => {
	console.error('Error:', err.message);
});

// Keep alive
setInterval(() => {}, 1000);
