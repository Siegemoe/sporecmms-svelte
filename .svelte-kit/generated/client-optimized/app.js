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
	() => import('./nodes/15')
];

export const server_loads = [0];

export const dictionary = {
		"/": [~2],
		"/assets": [~3],
		"/assets/[id]": [~4],
		"/audit-log": [~5],
		"/auth/login": [~6],
		"/auth/logout": [7],
		"/auth/register": [~8],
		"/dashboard": [~9],
		"/profile": [~10],
		"/sites": [~11],
		"/sites/[id]": [~12],
		"/users": [~13],
		"/work-orders": [~14],
		"/work-orders/[id]": [~15]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
};

export { default as root } from '../root.svelte';