// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				id: string;
				email: string;
				firstName: string | null;
				lastName: string | null;
				role: 'ADMIN' | 'MANAGER' | 'TECHNICIAN';
				orgId: string;
			} | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// WebSocket broadcast function injected by custom server
	var __wsBroadcast: ((orgId: string, message: unknown) => void) | undefined;
}

export {};
