<script lang="ts">
	import { enhance } from '$app/forms';
	export let form;
	let loading = false;
</script>

<svelte:head>
	<title>Spore CMMS - Maintenance Management Reimagined</title>
	<meta name="description" content="Simple, mobile-first CMMS for property management. Real-time updates, multi-site support, and intuitive work order management." />
</svelte:head>

<!-- Landing Page - Public -->
<div class="min-h-screen bg-gradient-to-br from-spore-dark via-spore-steel to-spore-dark">
	<!-- Hero Section -->
	<section class="px-4 py-20 md:py-32">
		<div class="max-w-6xl mx-auto text-center">
			<!-- Logo -->
			<div class="flex items-center justify-center gap-3 mb-8">
				<span class="text-4xl md:text-5xl font-extrabold text-spore-cream tracking-tight">SPORE</span>
				<span class="text-lg md:text-xl font-medium text-spore-steel uppercase tracking-widest bg-spore-cream/10 px-3 py-1 rounded-full">CMMS</span>
			</div>

			<!-- Headline -->
			<h1 class="text-4xl md:text-6xl font-extrabold text-spore-cream mb-6 leading-tight">
				Simple CMMS for<br/>
				<span class="text-spore-orange">Property Management</span>
			</h1>

			<!-- Subtitle -->
			<p class="text-xl md:text-2xl text-spore-cream/80 mb-12 max-w-3xl mx-auto leading-relaxed">
				Streamline maintenance operations with real-time updates, mobile-first design, and multi-site support. Join the future of maintenance.
			</p>

			<!-- CTA / Waitlist Form -->
			<div class="flex flex-col items-center justify-center w-full max-w-lg mx-auto">
				{#if form?.success}
					<div class="bg-spore-forest/30 border border-spore-forest text-spore-cream px-8 py-6 rounded-xl w-full text-center shadow-lg backdrop-blur-sm">
						<span class="text-2xl mr-2 block mb-2">✅</span>
						<h3 class="text-xl font-bold mb-1">You're on the list!</h3>
						<p class="text-spore-cream/70">We'll be in touch with your early access invite soon.</p>
					</div>
				{:else}
					<form 
						method="POST" 
						action="?/joinWaitlist" 
						use:enhance={() => {
							loading = true;
							return async ({ update }) => {
								await update();
								loading = false;
							};
						}}
						class="flex flex-col sm:flex-row gap-3 w-full"
					>
						<input
							type="email"
							name="email"
							placeholder="Enter your work email"
							required
							class="flex-1 bg-spore-white/10 border border-spore-cream/20 text-spore-cream placeholder-spore-cream/40 rounded-xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-spore-orange transition-all backdrop-blur-sm"
						/>
						<button
							type="submit"
							disabled={loading}
							class="bg-spore-orange text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-spore-orange/90 focus:outline-none focus:ring-4 focus:ring-spore-orange/50 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap"
						>
							{loading ? 'Joining...' : 'Join Waitlist'}
						</button>
					</form>
					{#if form?.error}
						<p class="text-red-400 mt-3 text-sm font-medium bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/20">{form.error}</p>
					{/if}
					
					<div class="mt-8 flex flex-col sm:flex-row items-center gap-6 text-sm">
						<a href="/auth/login" class="text-spore-cream/60 hover:text-spore-orange font-medium transition-colors">
							Existing user? Sign in →
						</a>
						<a href="#features" class="text-spore-cream/60 hover:text-spore-cream font-medium transition-colors">
							Learn more ↓
						</a>
					</div>
				{/if}
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section id="features" class="px-4 py-20 bg-spore-steel/10 backdrop-blur-sm border-y border-spore-steel/20">
		<div class="max-w-6xl mx-auto">
			<h2 class="text-3xl md:text-4xl font-extrabold text-spore-cream text-center mb-16">Built for Property Teams</h2>

			<div class="grid md:grid-cols-3 gap-8">
				<!-- Feature 1 -->
				<div class="bg-spore-dark/50 rounded-2xl p-8 border border-spore-steel/30 hover:border-spore-orange/50 transition-all hover:-translate-y-1">
					<div class="text-4xl mb-4 bg-spore-orange/10 w-16 h-16 rounded-full flex items-center justify-center">📱</div>
					<h3 class="text-xl font-bold text-spore-cream mb-3">Mobile-First Design</h3>
					<p class="text-spore-cream/70 leading-relaxed">
						Work orders, updates, and communications work seamlessly on any device. Perfect for field teams who need to stay connected from anywhere.
					</p>
				</div>

				<!-- Feature 2 -->
				<div class="bg-spore-dark/50 rounded-2xl p-8 border border-spore-steel/30 hover:border-spore-orange/50 transition-all hover:-translate-y-1">
					<div class="text-4xl mb-4 bg-spore-orange/10 w-16 h-16 rounded-full flex items-center justify-center">⚡</div>
					<h3 class="text-xl font-bold text-spore-cream mb-3">Real-Time Updates</h3>
					<p class="text-spore-cream/70 leading-relaxed">
						Instant notifications when work orders are created, assigned, or completed. Keep your entire team in sync without constant check-ins.
					</p>
				</div>

				<!-- Feature 3 -->
				<div class="bg-spore-dark/50 rounded-2xl p-8 border border-spore-steel/30 hover:border-spore-orange/50 transition-all hover:-translate-y-1">
					<div class="text-4xl mb-4 bg-spore-orange/10 w-16 h-16 rounded-full flex items-center justify-center">🏢</div>
					<h3 class="text-xl font-bold text-spore-cream mb-3">Multi-Site Support</h3>
					<p class="text-spore-cream/70 leading-relaxed">
						Manage multiple properties, buildings, and assets from a single dashboard. Organize by location with room-level tracking.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="px-4 py-12 border-t border-spore-steel/20 bg-spore-dark">
		<div class="max-w-6xl mx-auto">
			<div class="flex flex-col md:flex-row justify-between items-center gap-4">
				<div class="flex items-center gap-2">
					<span class="text-xl font-extrabold text-spore-cream">SPORE</span>
					<span class="text-sm font-medium text-spore-steel uppercase tracking-widest">CMMS</span>
				</div>
				<div class="text-sm text-spore-cream/40">
					© 2025 Spore Intelligent Systems. All rights reserved.
				</div>
			</div>
		</div>
	</footer>
</div>