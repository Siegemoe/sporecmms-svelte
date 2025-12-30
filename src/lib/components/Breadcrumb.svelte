<script lang="ts">
	import { page } from '$app/stores';
	import { getBreadcrumbs, isPathExcluded } from '$lib/breadcrumbs/utils';

	let currentPathname = '';

	// Subscribe to page changes
	$: if ($page.url) {
		currentPathname = $page.url.pathname;
	}

	$: showBreadcrumbs = !isPathExcluded(currentPathname);

	$: breadcrumbs = getBreadcrumbs(
		currentPathname,
		$page.params || {},
		{ pageData: $page.data, user: { role: $page.data?.user?.role } },
		$page.data?.user?.role
	);
</script>

{#if showBreadcrumbs && breadcrumbs.length > 0}
	<nav class="bg-spore-steel border-b border-spore-cream" aria-label="Breadcrumb">
		<div class="max-w-7xl mx-auto px-4 py-2">
			<ol class="flex items-center gap-2 text-sm overflow-x-auto">
				{#each breadcrumbs as crumb, index}
					<li class="flex items-center gap-2">
						{#if index > 0}
							<svg
								class="w-4 h-4 text-spore-cream/30 flex-shrink-0"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fill-rule="evenodd"
									d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
									clip-rule="evenodd"
								/>
							</svg>
						{/if}}
						{#if crumb.href}
							<a
								href={crumb.href}
								class="flex items-center gap-1.5 text-spore-cream/60 hover:text-spore-orange transition-colors"
							>
								{#if crumb.icon}<span class="flex-shrink-0">{crumb.icon}</span>{/if}
								<span class="truncate max-w-[200px]">{crumb.title}</span>
							</a>
						{:else}
							<span class="flex items-center gap-1.5 text-spore-orange font-semibold">
								{#if crumb.icon}<span class="flex-shrink-0">{crumb.icon}</span>{/if}
								<span class="truncate max-w-[200px]">{crumb.title}</span>
							</span>
						{/if}
					</li>
				{/each}
			</ol>
		</div>
	</nav>
{/if}
