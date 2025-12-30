import { breadcrumbConfig } from './config';
import type { BreadcrumbItem, BreadcrumbContextData } from './types';

/**
 * Check if a path should be excluded from breadcrumbs
 */
export function isPathExcluded(pathname: string): boolean {
	return breadcrumbConfig.excludedPaths.some((pattern) => {
		const regex = new RegExp(`^${pattern}$`);
		return regex.test(pathname);
	});
}

/**
 * Convert a route pattern to a regex for matching
 */
function patternToRegex(pattern: string): RegExp {
	return new RegExp(
		'^' + pattern.replace(/\[([^\]]+)\]/g, '([^/]+)') + '$'
	);
}

/**
 * Extract params from a path based on a route pattern
 */
function extractParams(pattern: string, pathname: string): Record<string, string> | null {
	const regex = patternToRegex(pattern);
	const match = pathname.match(regex);
	if (!match) return null;

	const paramNames = pattern.match(/\[([^\]]+)\]/g) || [];
	const params: Record<string, string> = {};

	paramNames.forEach((param, index) => {
		const paramName = param.slice(1, -1);
		params[paramName] = match[index + 1];
	});

	return params;
}

/**
 * Find a matching route configuration for the current path
 */
function findRoute(
	pathname: string
): { route: typeof breadcrumbConfig.routes[0]; params: Record<string, string> } | null {
	for (const route of breadcrumbConfig.routes) {
		const params = extractParams(route.path, pathname);
		if (params) {
			return { route, params };
		}
	}
	return null;
}

/**
 * Get the parent path for a given route pattern
 */
function getParentPath(routePath: string, explicitParent?: string): string | null {
	if (explicitParent) return explicitParent;

	// Auto-derive: remove the last segment
	const segments = routePath.split('/').filter(Boolean);
	if (segments.length <= 1) return null;
	segments.pop();
	return '/' + segments.join('/');
}

/**
 * Generate href from pattern with params
 */
function buildHref(pattern: string, params: Record<string, string>): string {
	let href = pattern;
	Object.entries(params).forEach(([key, value]) => {
		href = href.replace(`[${key}]`, value);
	});
	return href;
}

/**
 * Build the full breadcrumb trail for a path
 */
export function getBreadcrumbs(
	pathname: string,
	pageParams: Record<string, string>,
	pageData: BreadcrumbContextData,
	userRole?: string
): BreadcrumbItem[] {
	const items: BreadcrumbItem[] = [];

	// Find matching route
	const match = findRoute(pathname);
	if (!match) return items;

	const { route, params } = match;

	// Check role-based visibility
	if (route.role && route.role !== userRole) return items;

	// Build hierarchy by walking up parent chain
	const visited = new Set<string>();

	const buildHierarchy = (currentPath: string): BreadcrumbItem[] => {
		if (visited.has(currentPath)) return [];
		visited.add(currentPath);

		const routeMatch = findRoute(currentPath);
		if (!routeMatch) return [];

		const { route: currentRoute, params: currentParams } = routeMatch;

		// Check role for parent routes too
		if (currentRoute.role && currentRoute.role !== userRole) return [];

		const parentPath = getParentPath(currentRoute.path, currentRoute.parent);
		const parentItems = parentPath ? buildHierarchy(parentPath) : [];

		// Determine title
		let title = currentRoute.title;
		if (currentRoute.dynamic && currentRoute.fetchTitle) {
			title = currentRoute.fetchTitle(currentParams, { pageData, user: { role: userRole } }) as string;
		}

		// Generate href
		const href = buildHref(currentRoute.path, currentParams);
		const isCurrentPage = href === pathname;

		return [
			...parentItems,
			{
				title,
				href: isCurrentPage ? undefined : href,
				icon: currentRoute.icon
			}
		];
	};

	return buildHierarchy(pathname);
}
