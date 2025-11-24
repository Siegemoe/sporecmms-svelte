<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;

	let showCreateRoom = false;
	let isSubmitting = false;
	let newRoom = { name: '', building: '', floor: '' };
	let editingRoomId: string | null = null;
	let editingRoom = { name: '', building: '', floor: '' };

	$: site = data.site;
	$: roomsByBuilding = data.roomsByBuilding || {};
	$: buildingNames = Object.keys(roomsByBuilding).sort();

	function startEditRoom(room: any) {
		editingRoomId = room.id;
		editingRoom = { 
			name: room.name, 
			building: room.building || '', 
			floor: room.floor?.toString() || '' 
		};
	}

	function cancelEditRoom() {
		editingRoomId = null;
		editingRoom = { name: '', building: '', floor: '' };
	}
</script>

<div class="max-w-7xl mx-auto px-4 py-10">
	<!-- Breadcrumb -->
	<div class="mb-6">
		<a href="/sites" class="text-spore-cream/60 hover:text-spore-cream text-sm font-medium">
			← Back to Sites
		</a>
	</div>

	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
		<div>
			<h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">{site.name}</h1>
			<p class="text-spore-cream/60 mt-2 text-sm font-medium">
				{site.rooms?.length || 0} room{site.rooms?.length !== 1 ? 's' : ''}
			</p>
		</div>
		<button 
			on:click={() => showCreateRoom = !showCreateRoom}
			class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold tracking-wide"
		>
			{showCreateRoom ? 'CANCEL' : '+ ADD ROOM'}
		</button>
	</div>

	<!-- Create Room Form -->
	{#if showCreateRoom}
		<div class="bg-spore-white rounded-xl p-6 mb-8">
			<h2 class="text-lg font-bold text-spore-dark mb-4">Add New Room</h2>
			<form 
				method="POST" 
				action="?/createRoom"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						await update();
						isSubmitting = false;
						showCreateRoom = false;
						newRoom = { name: '', building: '', floor: '' };
					};
				}}
				class="grid grid-cols-1 sm:grid-cols-4 gap-4"
			>
				<input
					type="text"
					name="name"
					bind:value={newRoom.name}
					placeholder="Room name/number"
					class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"
					required
				/>
				<input
					type="text"
					name="building"
					bind:value={newRoom.building}
					placeholder="Building (e.g., A, Main)"
					class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"
				/>
				<input
					type="number"
					name="floor"
					bind:value={newRoom.floor}
					placeholder="Floor"
					class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"
				/>
				<button
					type="submit"
					disabled={isSubmitting || !newRoom.name.trim()}
					class="bg-spore-forest text-white px-6 py-3 rounded-lg font-bold text-sm tracking-wide hover:bg-spore-forest/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{isSubmitting ? 'ADDING...' : 'ADD ROOM'}
				</button>
			</form>
		</div>
	{/if}

	<!-- Rooms by Building -->
	{#if buildingNames.length > 0}
		<div class="space-y-8">
			{#each buildingNames as building}
				<div class="bg-spore-white rounded-xl overflow-hidden">
					<!-- Building Header -->
					<div class="bg-spore-dark px-6 py-4">
						<h2 class="text-lg font-bold text-spore-cream">
							{building === 'Unassigned' ? 'Unassigned Rooms' : `Building ${building}`}
						</h2>
						<p class="text-spore-cream/60 text-sm">
							{roomsByBuilding[building].length} room{roomsByBuilding[building].length !== 1 ? 's' : ''}
						</p>
					</div>
					
					<!-- Rooms Grid -->
					<div class="p-6">
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{#each roomsByBuilding[building] as room (room.id)}
								{#if editingRoomId === room.id}
									<!-- Edit Mode -->
									<div class="bg-spore-cream/20 rounded-lg p-4 border-2 border-spore-orange">
										<form 
											method="POST" 
											action="?/updateRoom"
											use:enhance={() => {
												isSubmitting = true;
												return async ({ update }) => {
													await update();
													isSubmitting = false;
													cancelEditRoom();
												};
											}}
										>
											<input type="hidden" name="roomId" value={room.id} />
											<div class="space-y-3">
												<input
													type="text"
													name="name"
													bind:value={editingRoom.name}
													placeholder="Room name"
													class="w-full px-3 py-2 rounded border border-spore-cream bg-white text-spore-dark text-sm focus:outline-none focus:ring-2 focus:ring-spore-orange"
													required
												/>
												<div class="grid grid-cols-2 gap-2">
													<input
														type="text"
														name="building"
														bind:value={editingRoom.building}
														placeholder="Building"
														class="px-3 py-2 rounded border border-spore-cream bg-white text-spore-dark text-sm focus:outline-none focus:ring-2 focus:ring-spore-orange"
													/>
													<input
														type="number"
														name="floor"
														bind:value={editingRoom.floor}
														placeholder="Floor"
														class="px-3 py-2 rounded border border-spore-cream bg-white text-spore-dark text-sm focus:outline-none focus:ring-2 focus:ring-spore-orange"
													/>
												</div>
												<div class="flex gap-2">
													<button
														type="submit"
														disabled={isSubmitting || !editingRoom.name.trim()}
														class="flex-1 bg-spore-forest text-white px-3 py-2 rounded font-bold text-xs hover:bg-spore-forest/90 disabled:opacity-50 transition-colors"
													>
														{isSubmitting ? 'SAVING...' : 'SAVE'}
													</button>
													<button
														type="button"
														on:click={cancelEditRoom}
														class="px-3 py-2 rounded font-bold text-xs text-spore-steel hover:bg-spore-cream transition-colors"
													>
														CANCEL
													</button>
												</div>
											</div>
										</form>
									</div>
								{:else}
									<!-- View Mode -->
									<div class="bg-spore-cream/20 rounded-lg p-4 border border-spore-cream/50 group hover:border-spore-orange/50 transition-colors">
										<div class="flex justify-between items-start">
											<div>
												<h3 class="font-bold text-spore-dark">Room {room.name}</h3>
												<p class="text-sm text-spore-steel mt-1">
													{#if room.floor}Floor {room.floor}{/if}
													{#if room._count?.assets}
														<span class="ml-2">• {room._count.assets} asset{room._count.assets !== 1 ? 's' : ''}</span>
													{/if}
												</p>
											</div>
											<div class="flex gap-2">
												<button
													on:click={() => startEditRoom(room)}
													class="text-spore-steel/40 hover:text-spore-orange transition-colors opacity-0 group-hover:opacity-100"
												>
													✏️
												</button>
												<form 
													method="POST" 
													action="?/deleteRoom"
													use:enhance
												>
													<input type="hidden" name="roomId" value={room.id} />
													<button
														type="submit"
														class="text-spore-steel/40 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
														on:click|preventDefault={(e) => {
															if (confirm('Delete this room? This will also delete all assets in this room.')) {
																e.currentTarget.closest('form')?.requestSubmit();
															}
														}}
													>
														✕
													</button>
												</form>
											</div>
										</div>
										<div class="mt-4 pt-3 border-t border-spore-cream/50">
											<a 
												href="/assets?room={room.id}" 
												class="text-xs font-semibold text-spore-orange hover:text-spore-orange/80"
											>
												View Assets →
											</a>
										</div>
									</div>
								{/if}
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="text-center py-16 bg-spore-white rounded-xl">
			<div class="text-5xl mb-4">🚪</div>
			<h3 class="text-xl font-bold text-spore-dark mb-2">No rooms yet</h3>
			<p class="text-spore-steel mb-6">Add rooms to this site to start tracking assets</p>
			<button 
				on:click={() => showCreateRoom = true}
				class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold"
			>
				+ ADD ROOM
			</button>
		</div>
	{/if}
</div>
