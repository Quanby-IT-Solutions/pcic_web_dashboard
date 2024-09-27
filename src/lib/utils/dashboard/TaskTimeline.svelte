<script lang="ts">
	import spinner from '$lib/assets/pcic-spinner.gif';
	import { onMount, createEventDispatcher } from 'svelte';
	import { User, AlertCircle, ArrowLeft } from 'lucide-svelte';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import mapboxgl from 'mapbox-gl';
	import { supabase_content } from '../../../supabase';

	export let userId: string;
	export let selectedMonth: number;
	export let selectedDay: number;
	export let selectedWeek: number;

	interface SupabaseLog {
		timestamp: string;
		activity: string;
		sync_status: string;
		longlat: string | null;
		task_id: string | null;
	}

	interface Task {
		id: string;
		task_number: string;
	}

	let userLogs: SupabaseLog[] = [];
	let filteredLogs: SupabaseLog[] = [];
	let tasks: Task[] = [];
	let selectedTaskId: string | null = null;
	let isLoading = true;
	let dataError: string | null = null;
	let map: mapboxgl.Map | null = null;
	let marker: mapboxgl.Marker | null = null;

	const dispatch = createEventDispatcher();

	mapboxgl.accessToken = 'pk.eyJ1IjoicXVhbmJ5ZGV2cyIsImEiOiJjbHplNmtybm4wbHZsMmlva3pkbDY2bG1yIn0.I-82-7hu310FPXYvKTIMMQ';

	async function fetchUserLogs() {
		try {
			const { data, error } = await supabase_content
				.from('user_logs')
				.select('timestamp, activity, sync_status, longlat, task_id')
				.eq('user_id', userId)
				.order('timestamp', { ascending: false });

			if (error) throw error;

			if (!data || data.length === 0) {
				dataError = 'No timeline available for this user.';
			} else {
				userLogs = data;
				await fetchTasksForUser();
				filterLogs();
			}
		} catch (error) {
			dataError = error instanceof Error ? error.message : 'An unknown error occurred';
			console.error('Fetch error:', error);
		} finally {
			isLoading = false;
		}
	}

	async function fetchTasksForUser() {
		const filteredLogsForTasks = userLogs.filter((log) => {
			const logDate = new Date(log.timestamp);
			const logMonth = logDate.getMonth();
			const logDay = logDate.getDate();
			const logWeek = Math.ceil(logDay / 7);

			return (
				logMonth === selectedMonth &&
				(selectedDay ? logDay === selectedDay : true) &&
				(selectedWeek ? logWeek === selectedWeek : true)
			);
		});

		const taskIds = [...new Set(filteredLogsForTasks.map(log => log.task_id).filter(Boolean))];

		if (taskIds.length === 0) {
			tasks = [];
			return;
		}

		try {
			const { data, error } = await supabase_content
				.from('tasks')
				.select('id, task_number')
				.in('id', taskIds);

			if (error) throw error;

			tasks = data || [];
		} catch (error) {
			console.error('Error fetching tasks:', error);
		}
	}

	function filterLogs() {
		filteredLogs = userLogs.filter((log) => {
			const logDate = new Date(log.timestamp);
			const logMonth = logDate.getMonth();
			const logDay = logDate.getDate();
			const logWeek = Math.ceil(logDay / 7);

			return (
				(selectedTaskId ? log.task_id === selectedTaskId : true) &&
				logMonth === selectedMonth &&
				(selectedDay ? logDay === selectedDay : true) &&
				(selectedWeek ? logWeek === selectedWeek : true)
			);
		});
	}

	function initializeMap() {
		const mapStyle = getMapStyle();

		if (filteredLogs.length > 0 && filteredLogs[0].longlat) {
			const [lng, lat] = filteredLogs[0].longlat.split(',').map(Number);

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

			updateMapLocation(filteredLogs[0].longlat);
		}
	}

	function getMapStyle(): string {
		const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
		return isDarkMode ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/light-v10';
	}

	function updateMapLocation(longlat: string | null) {
		if (!map || !longlat) return;

		const [lng, lat] = longlat.split(',').map(Number);

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

	function goBack() {
		dispatch('back');
	}

	function handleTaskChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		selectedTaskId = select.value === 'all' ? null : select.value;
		filterLogs();
	}

	onMount(() => {
		fetchUserLogs().then(() => {
			if (filteredLogs.length > 0) {
				initializeMap();
			}
		});

		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
			if (map) {
				const newStyle = e.matches
					? 'mapbox://styles/mapbox/dark-v10'
					: 'mapbox://styles/mapbox/light-v10';
				map.setStyle(newStyle);
			}
		});
	});
</script>

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

	<!-- Native Dropdown for Task Filter -->
	<div class="p-4">
		<label for="taskFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Task</label>
		<select
			id="taskFilter"
			class="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
			on:change={handleTaskChange}
		>
			<option value="all">All Tasks</option>
			{#each tasks as task}
				<option value={task.id}>{task.task_number}</option>
			{/each}
		</select>
	</div>

	{#if isLoading}
		<div class="flex flex-grow items-center justify-center">
			<img src={spinner} alt="Loading..." class="h-16 w-16" />
		</div>
	{:else if dataError || filteredLogs.length === 0}
		<div class="flex flex-grow flex-col items-center justify-center p-8 text-center">
			<AlertCircle size={48} class="mb-4 text-yellow-400" />
			<h2 class="mb-2 text-2xl font-bold">No Timeline Data Available</h2>
			<p class="max-w-md text-gray-400">
				{dataError ? dataError : "No logs available for this user with the current filter."}
			</p>
		</div>
	{:else}
		<div class="flex flex-grow overflow-hidden">
			<div class="custom-scrollbar w-1/2 overflow-y-auto p-4">
				{#each filteredLogs as log}
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