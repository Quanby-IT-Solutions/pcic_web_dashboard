<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { supabase_content } from '../../../supabase';
  import { User, AlertCircle, ArrowLeft } from 'lucide-svelte';
  import 'mapbox-gl/dist/mapbox-gl.css';
  import mapboxgl from 'mapbox-gl';

  export let userId: string;

  interface SupabaseLog {
    timestamp: string;
    activity: string;
    sync_status: string;
    longlat: string | null;
  }

  let userLogs: SupabaseLog[] = [];
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

  function initializeMap() {
    // Detect if the user prefers dark mode
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const mapStyle = isDarkMode ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/light-v10';

    if (userLogs.length > 0 && userLogs[0].longlat) {
      const [lat, lng] = userLogs[0].longlat.split(',').map(Number);
      map = new mapboxgl.Map({
        container: 'map',
        style: mapStyle,
        center: [lng, lat],
        zoom: 12,
      });
      updateMapLocation(userLogs[0].longlat);
    }
  }

  function updateMapLocation(longlat: string | null) {
    if (!map || !longlat) return;

    const [lat, lng] = longlat.split(',').map(Number);

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.error("Invalid latitude or longitude values:", { lat, lng });
      return;
    }

    if (!marker) {
      marker = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map);
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
      const newStyle = e.matches ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/light-v10';
      map.setStyle(newStyle);
    }
  });

  function goBack() {
    dispatch('back');
  }

  onMount(() => {
    fetchUserLogs().then(() => {
      if (userLogs.length > 0) {
        initializeMap();
      }
    });
  });
</script>

<div class="flex flex-col h-screen w-full">
  <div class="p-4 flex justify-between items-center">
    <button
      class="flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-300"
      on:click={goBack}
    >
      <ArrowLeft size={24} class="mr-2" />
      Back to Users
    </button>
    <h1 class="text-xl font-bold">User Timeline</h1>
  </div>

  {#if isLoading}
    <div class="flex-grow flex items-center justify-center">
      <img src="/images/pcic-spinner.gif" alt="Loading..." class="h-16 w-16"/>
    </div>
  {:else if dataError || userLogs.length === 0}
    <div class="flex-grow flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle size={48} class="text-yellow-400 mb-4" />
      <h2 class="text-2xl font-bold mb-2">No Timeline Data Available</h2>
      <p class="text-gray-400 max-w-md">
        We couldn't find any timeline data for this user. This could be because the user hasn't performed any logged activities yet.
      </p>
    </div>
  {:else}
    <div class="flex-grow flex overflow-hidden">
      <div class="w-1/2 overflow-y-auto p-4 custom-scrollbar">
        {#each userLogs as log}
          <div class="rounded-lg p-4 shadow mb-4 transition-all duration-300 hover:bg-gray-700">
            <div class="flex justify-between items-start mb-2">
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
                  class="p-2 rounded-full hover:bg-white transition-colors duration-300"
                  on:click={() => updateMapLocation(log.longlat)}
                >
                  <User size={16} />
                </button>
              {/if}
            </div>
            <h3 class="text-lg font-semibold mb-1">{log.activity}</h3>
            <p class="text-sm text-gray-400">{log.sync_status}</p>
            {#if log.longlat}
              <p class="text-sm text-gray-400 mt-1">Location: {log.longlat}</p>
            {/if}
          </div>
        {/each}
      </div>

      <div id="map" class="w-1/2 h-full"></div>
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
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #2d3748;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #4a5568;
    border-radius: 4px;
  }
</style>
