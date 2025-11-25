<svelte:head>
	<title>Spore CMMS - Simple Property Maintenance Management</title>
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
				Streamline maintenance operations with real-time updates, mobile-first design, and multi-site support. Built for property managers who need efficiency without complexity.
			</p>

			<!-- CTA -->
			<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
				<a
					href="/auth/login"
					class="bg-spore-orange text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-spore-orange/90 focus:outline-none focus:ring-4 focus:ring-spore-orange/50 transition-all transform hover:scale-105 shadow-lg"
				>
					Try the Demo
				</a>
				<a
					href="#features"
					class="border-2 border-spore-cream/30 text-spore-cream px-8 py-4 rounded-xl font-bold text-lg hover:bg-spore-cream/10 focus:outline-none focus:ring-4 focus:ring-spore-cream/20 transition-all"
				>
					Learn More
				</a>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section id="features" class="px-4 py-20 bg-spore-steel/30">
		<div class="max-w-6xl mx-auto">
			<h2 class="text-3xl md:text-4xl font-extrabold text-spore-cream text-center mb-16">Built for Property Teams</h2>

			<div class="grid md:grid-cols-3 gap-8">
				<!-- Feature 1 -->
				<div class="bg-spore-dark rounded-2xl p-8 border border-spore-steel/50 hover:border-spore-orange/50 transition-colors">
					<div class="text-4xl mb-4">📱</div>
					<h3 class="text-xl font-bold text-spore-cream mb-3">Mobile-First Design</h3>
					<p class="text-spore-cream/70 leading-relaxed">
						Work orders, updates, and communications work seamlessly on any device. Perfect for field teams who need to stay connected from anywhere.
					</p>
				</div>

				<!-- Feature 2 -->
				<div class="bg-spore-dark rounded-2xl p-8 border border-spore-steel/50 hover:border-spore-orange/50 transition-colors">
					<div class="text-4xl mb-4">⚡</div>
					<h3 class="text-xl font-bold text-spore-cream mb-3">Real-Time Updates</h3>
					<p class="text-spore-cream/70 leading-relaxed">
						Instant notifications when work orders are created, assigned, or completed. Keep your entire team in sync without constant check-ins.
					</p>
				</div>

				<!-- Feature 3 -->
				<div class="bg-spore-dark rounded-2xl p-8 border border-spore-steel/50 hover:border-spore-orange/50 transition-colors">
					<div class="text-4xl mb-4">🏢</div>
					<h3 class="text-xl font-bold text-spore-cream mb-3">Multi-Site Support</h3>
					<p class="text-spore-cream/70 leading-relaxed">
						Manage multiple properties, buildings, and assets from a single dashboard. Organize by location with room-level tracking.
					</p>
				</div>
			</div>

			<!-- Additional Features -->
			<div class="grid md:grid-cols-2 gap-8 mt-8">
				<div class="bg-spore-dark rounded-2xl p-8 border border-spore-steel/50 hover:border-spore-orange/50 transition-colors">
					<div class="text-3xl mb-4">🔧</div>
					<h3 class="text-xl font-bold text-spore-cream mb-3">Asset Management</h3>
					<p class="text-spore-cream/70 leading-relaxed">
						Track equipment, maintenance history, and failure patterns. Prevent breakdowns with proactive maintenance scheduling.
					</p>
				</div>

				<div class="bg-spore-dark rounded-2xl p-8 border border-spore-steel/50 hover:border-spore-orange/50 transition-colors">
					<div class="text-3xl mb-4">📊</div>
					<h3 class="text-xl font-bold text-spore-cream mb-3">Simple Analytics</h3>
					<p class="text-spore-cream/70 leading-relaxed">
						Dashboard insights into work order status, team performance, and maintenance trends. Make data-driven decisions without complexity.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="px-4 py-20">
		<div class="max-w-4xl mx-auto text-center">
			<h2 class="text-3xl md:text-4xl font-extrabold text-spore-cream mb-6">
				Ready to simplify<br/>
				<span class="text-spore-orange">property maintenance?</span>
			</h2>
			<p class="text-xl text-spore-cream/80 mb-12">
				Try the demo to see how Spore CMMS can transform your maintenance operations.
			</p>
			<a
				href="/auth/login"
				class="bg-spore-orange text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-spore-orange/90 focus:outline-none focus:ring-4 focus:ring-spore-orange/50 transition-all transform hover:scale-105 shadow-lg inline-block"
			>
				Start Free Demo
			</a>
		</div>
	</section>

	<!-- Footer -->
	<footer class="px-4 py-12 border-t border-spore-steel/50">
		<div class="max-w-6xl mx-auto">
			<div class="flex flex-col md:flex-row justify-between items-center">
				<div class="flex items-center gap-2 mb-4 md:mb-0">
					<span class="text-xl font-extrabold text-spore-cream">SPORE</span>
					<span class="text-sm font-medium text-spore-steel uppercase tracking-widest">CMMS</span>
				</div>
				<div class="text-sm text-spore-cream/60">
					© 2024 Spore Intelligent Systems. Built for property teams.
				</div>
			</div>
		</div>
	</footer>
</div>
