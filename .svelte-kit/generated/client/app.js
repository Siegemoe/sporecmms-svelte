export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20'),
	() => import('./nodes/21')
];

export const server_loads = [0];

export const dictionary = {
		"/": [~2],
		"/assets": [~3],
		"/assets/[id]": [~4],
		"/audit-log": [~5],
		"/auth/emergency-reset": [~6],
		"/auth/login": [~7],
		"/auth/logout": [~8],
		"/auth/register": [~9],
		"/auth/reset-password/[token]": [~10],
		"/dashboard": [~11],
		"/join-organization": [~12],
		"/onboarding": [~13],
		"/profile": [~14],
		"/select-organization": [~15],
		"/sites": [~16],
		"/sites/[id]": [~17],
		"/users": [~18],
		"/users/security": [19],
		"/work-orders": [~20],
		"/work-orders/[id]": [~21]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
};

export { default as root } from '../root.svelte';