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
	() => import('./nodes/19')
];

export const server_loads = [0];

export const dictionary = {
		"/": [2],
		"/assets": [~3],
		"/assets/[id]": [~4],
		"/audit-log": [~5],
		"/auth/login": [~6],
		"/auth/logout": [7],
		"/auth/register": [~8],
		"/dashboard": [~9],
		"/join-organization": [~10],
		"/onboarding": [~11],
		"/profile": [~12],
		"/select-organization": [~13],
		"/sites": [~14],
		"/sites/[id]": [~15],
		"/users": [~16],
		"/users/security": [17],
		"/work-orders": [~18],
		"/work-orders/[id]": [~19]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
};

export { default as root } from '../root.svelte';