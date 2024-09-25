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
