<script lang="ts">
	import spinner from '$lib/assets/pcic-spinner.gif';
	import { onMount, createEventDispatcher } from 'svelte';
	import { User, AlertCircle, ArrowLeft } from 'lucide-svelte';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import mapboxgl from 'mapbox-gl';
	import { supabase_content } from '../../../supabase';

	export let userId: string; // Ensure this prop is provided

	// Interface for the user logs fetched from Supabase
	interface SupabaseLog {
		timestamp: string;
		activity: string;
		sync_status: string;
		longlat: string | null;
	}

	// State variables
	let userLogs: SupabaseLog[] = [];
	let isLoading = true;
	let dataError: string | null = null;
	let map: mapboxgl.Map | null = null;
	let marker: mapboxgl.Marker | null = null;

	const dispatch = createEventDispatcher();

	// Mapbox access token
	mapboxgl.accessToken =
		'pk.eyJ1IjoicXVhbmJ5ZGV2cyIsImEiOiJjbHplNmtybm4wbHZsMmlva3pkbDY2bG1yIn0.I-82-7hu310FPXYvKTIMMQ';

	// Fetch user logs from Supabase
	async function fetchUserLogs() {
		try {
			const { data, error } = await supabase_content
				.from('user_logs')
				.select('timestamp, activity, sync_status, longlat')
				.eq('user_id', userId)
				.order('timestamp', { ascending: false });

			if (error) throw error;

			if (!data || data.length === 0) {
				dataError = 'No timeline available for this user.';
			} else {
				userLogs = data;
			}
		} catch (error) {
			dataError = error instanceof Error ? error.message : 'An unknown error occurred';
			console.error('Fetch error:', error);
		} finally {
			isLoading = false;
		}
	}

	// Initialize the map
	function initializeMap() {
		const mapStyle = getMapStyle();

		if (userLogs.length > 0 && userLogs[0].longlat) {
			const [lng, lat] = userLogs[0].longlat.split(',').map(Number); // Swapped order

			// Validate coordinates before using them
			if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
				console.error('Invalid latitude or longitude values:', { lat, lng });
				return;
			}

			
			map = new mapboxgl.Map({
				container: 'map',
				style: mapStyle,
				center: [lng, lat],
				zoom: 12
			});

			updateMapLocation(userLogs[0].longlat);
		}
	}

	// Get the current map style based on the theme
	function getMapStyle(): string {
		const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
		return isDarkMode ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/light-v10';
	}

	// Update the map location
	function updateMapLocation(longlat: string | null) {
		if (!map || !longlat) return;

		const [lng, lat] = longlat.split(',').map(Number); // Swapped order

		// Validate coordinates
		if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
			console.error('Invalid latitude or longitude values:', { lat, lng });
			return;
		}

		if (!marker) {
			marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);
		} else {
			marker.setLngLat([lng, lat]);
		}

		map.flyTo({
			center: [lng, lat],
			zoom: 15,
			speed: 1.2,
			curve: 1.42
		});
	}

	// Listener for theme change to update the map style dynamically
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
		if (map) {
			const newStyle = e.matches
				? 'mapbox://styles/mapbox/dark-v10'
				: 'mapbox://styles/mapbox/light-v10';
			map.setStyle(newStyle);
		}
	});

	// Function to go back to the previous screen
	function goBack() {
		dispatch('back');
	}

	// Fetch user logs and initialize the map on mount
	onMount(() => {
		fetchUserLogs().then(() => {
			if (userLogs.length > 0) {
				initializeMap();
			}
		});
	});
</script>

<!-- UI Structure -->
<div class="flex h-screen w-full flex-col">
	<div class="flex items-center justify-between p-4">
		<button
			class="flex items-center text-blue-400 transition-colors duration-300 hover:text-blue-300"
			on:click={goBack}
		>
			<ArrowLeft size={24} class="mr-2" />
			Back to Users
		</button>
		<h1 class="text-xl font-bold">User Timeline</h1>
	</div>

	{#if isLoading}
		<!-- Loading Spinner -->
		<div class="flex flex-grow items-center justify-center">
			<img src={spinner} alt="Loading..." class="h-16 w-16" />
		</div>
	{:else if dataError || userLogs.length === 0}
		<!-- Error or No Data Message -->
		<div class="flex flex-grow flex-col items-center justify-center p-8 text-center">
			<AlertCircle size={48} class="mb-4 text-yellow-400" />
			<h2 class="mb-2 text-2xl font-bold">No Timeline Data Available</h2>
			<p class="max-w-md text-gray-400">
				We couldn't find any timeline data for this user. This could be because the user hasn't
				performed any logged activities yet.
			</p>
		</div>
	{:else}
		<!-- User Logs and Map -->
		<div class="flex flex-grow overflow-hidden">
			<div class="custom-scrollbar w-1/2 overflow-y-auto p-4">
				{#each userLogs as log}
					<div class="mb-4 rounded-lg p-4 shadow transition-all duration-300 hover:bg-gray-700">
						<div class="mb-2 flex items-start justify-between">
							<span class="text-sm text-gray-400">
								{new Date(log.timestamp).toLocaleString('en-US', {
									year: 'numeric',
									month: '2-digit',
									day: '2-digit',
									hour: '2-digit',
									minute: '2-digit',
									hour12: true
								})}
							</span>
							{#if log.longlat}
								<button
									class="rounded-full p-2 transition-colors duration-300 hover:bg-white"
									on:click={() => updateMapLocation(log.longlat)}
								>
									<User size={16} />
								</button>
							{/if}
						</div>
						<h3 class="mb-1 text-lg font-semibold">{log.activity}</h3>
						<p class="text-sm text-gray-400">{log.sync_status}</p>
						{#if log.longlat}
							<p class="mt-1 text-sm text-gray-400">Location: {log.longlat}</p>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Map Container -->
			<div id="map" class="h-full w-1/2"></div>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
		color: gray;
	}

	.custom-scrollbar {
		scrollbar-width: thin;
		scrollbar-color: #4a5568 #2d3748;
	}

	.custom-scrollbar::-webkit-scrollbar {
		inline-size: 8px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: #2d3748;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: #4a5568;
		border-radius: 4px;
	}
</style>
