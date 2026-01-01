import type { BreadcrumbConfig } from './types';

export const breadcrumbConfig: BreadcrumbConfig = {
	excludedPaths: [
		'/',
		'/auth.*',
		'/onboarding',
		'/join-organization',
		'/select-organization'
	],

	routes: [
		{ path: '/dashboard', title: 'Dashboard', icon: '📊' },
		{
			path: '/work-orders',
			title: 'Work Orders',
			icon: '📋',
			parent: '/dashboard'
		},
		{
			path: '/work-orders/[id]',
			title: 'Work Order',
			dynamic: true,
			fetchTitle: (_params, data) => data.pageData?.workOrder?.title || 'Work Order',
			parent: '/work-orders'
		},
		{
			path: '/sites',
			title: 'Sites',
			icon: '🏢',
			parent: '/dashboard'
		},
		{
			path: '/sites/[id]',
			title: 'Site',
			dynamic: true,
			fetchTitle: (_params, data) => data.pageData?.site?.name || 'Site',
			parent: '/sites'
		},
		{
			path: '/assets',
			title: 'Assets',
			icon: '⚙️',
			parent: '/dashboard'
		},
		{
			path: '/assets/[id]',
			title: 'Asset',
			dynamic: true,
			fetchTitle: (_params, data) => data.pageData?.asset?.name || 'Asset',
			parent: '/assets'
		},
		{
			path: '/templates',
			title: 'Templates',
			icon: '📝',
			parent: '/dashboard'
		},
		{
			path: '/templates/[id]',
			title: 'Template',
			dynamic: true,
			fetchTitle: (_params, data) => data.pageData?.template?.name || 'Template',
			parent: '/templates'
		},
		{
			path: '/work-orders/new',
			title: 'New Work Order',
			parent: '/work-orders'
		},
		{
			path: '/users',
			title: 'Users',
			icon: '👥',
			parent: '/dashboard'
		},
		{ path: '/users/security', title: 'Security', parent: '/users' },
		{
			path: '/audit-log',
			title: 'Audit Log',
			icon: '📜',
			parent: '/dashboard'
		},
		{ path: '/profile', title: 'Profile' }
	]
};
