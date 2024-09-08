<script lang="ts">
	import no_user from '$lib/assets/no-user.png';
	import spinner from '$lib/assets/pcic-spinner.gif';
	import { onMount } from 'svelte';
	import { Button, Heading, Input, Select } from 'flowbite-svelte';
	import { PlusOutline } from 'flowbite-svelte-icons';
	import User from './User.svelte';
	import Delete from './Delete.svelte';
	import Toast from '../../../utils/widgets/Toast.svelte';
	import MetaTag from '../../../utils/MetaTag.svelte';
	import UserList from './UserList.svelte';

	export let data;
	$: ({ supabase } = data);

	let openUser = false;
	let openDelete = false;
	let userToDelete = '';
	let loggedInUser: any = null;

	let current_user: any = {};
	let users: any[] = [];
	let filteredUsers: any[] = [];
	let isLoading = true;
	let searchQuery = '';
	let selectedRole = '';
	let selectedRegion = '';
	const path = '/crud/users';
	const description = 'CRUD users example - PCIC Web Dashboard';
	const title = 'PCIC Web Dashboard - CRUD Users';
	const subtitle = 'CRUD Users';
	const regions = [
		'Region 1',
		'Region 2',
		'Region 3',
		'Region 4A',
		'Region 4B',
		'Region 5',
		'Region 6',
		'Region 7',
		'Region 8',
		'Region 9',
		'Region 10',
		'Region 11',
		'Region 12',
		'Region 13',
		'NCR',
		'CAR',
		'BARMM'
	];

	function formatRegionName(regionName: string | null | undefined): string {
		if (!regionName) return 'N/A';
		return regionName.replace(
			/^(Region\s)0*(\d+)$/,
			(_, prefix, number) => `${prefix}${parseInt(number)}`
		);
	}

	let toastProps: {
		show: boolean;
		message: string;
		type: 'success' | 'error' | 'info' | 'warning';
	} = {
		show: false,
		message: '',
		type: 'success'
	};

	let supabaseReady = false;

	let currentPage = 1;
	let itemsPerPage = 10;
	let paginatedUsers: any[] = [];

	onMount(async () => {
		if (supabase) {
			supabaseReady = true;
			const {
				data: { user }
			} = await supabase.auth.getUser();
			if (user) {
				await fetchLoggedInUserInfo(user.id);
				await fetchUsers();
			} else {
				console.error('No authenticated user found');
			}
		} else {
			console.error('Supabase client is not available');
		}
	});

	async function fetchLoggedInUserInfo(userId: string) {
		try {
			const { data: userInfo, error } = await supabase
				.from('users')
				.select('*, regions(region_name)')
				.eq('id', userId)
				.single();

			if (error) throw error;

			loggedInUser = userInfo;
			if (loggedInUser.role !== 'National_Admin') {
				selectedRegion = loggedInUser.regions.region_name;
			}
		} catch (error) {
			console.error('Error fetching logged-in user info:', error);
			showToast('Error fetching user information', 'error');
		}
	}

	async function fetchUsers() {
		try {
			console.log('Fetching users...');
			const { data: fetchedUsers, error } = await supabase
				.from('users')
				.select(
					`
                *,
                regions (
                    region_name
                )
            `
				)
				.order('created_at', { ascending: false });

			if (error) throw error;

			console.log('Fetched users data:', fetchedUsers);
			users = fetchedUsers || [];
			users.forEach((user) => {
				console.log(`User ${user.inspector_name} region:`, user.regions?.region_name);
			});
			filterUsers();

			if (users.length === 0) {
				console.log('No users found in the database.');
			}
		} catch (error) {
			console.error('Error fetching users:', error);
			showToast(
				'Error fetching users: ' + (error instanceof Error ? error.message : String(error)),
				'error'
			);
		} finally {
			isLoading = false;
		}
	}

	function filterUsers() {
		filteredUsers = users.filter((user) => {
			const nameMatch = user.inspector_name.toLowerCase().includes(searchQuery.toLowerCase());
			const roleMatch = selectedRole === '' || user.role === selectedRole;
			let regionMatch = true;

			if (loggedInUser.role === 'National_Admin') {
				regionMatch =
					selectedRegion === '' ||
					formatRegionName(user.regions?.region_name) === formatRegionName(selectedRegion);
			} else {
				regionMatch =
					formatRegionName(user.regions?.region_name) ===
					formatRegionName(loggedInUser.regions?.region_name);
			}

			return nameMatch && roleMatch && regionMatch;
		});
		paginateUsers();
	}

	function paginateUsers() {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		paginatedUsers = filteredUsers.slice(startIndex, endIndex);
	}

	function handleNextPage() {
		if (currentPage * itemsPerPage < filteredUsers.length) {
			currentPage += 1;
			paginateUsers();
		}
	}

	function handlePreviousPage() {
		if (currentPage > 1) {
			currentPage -= 1;
			paginateUsers();
		}
	}

	function handleUserAdded(event: CustomEvent) {
		users = [event.detail, ...users];
		filterUsers();
		showToast('User added successfully', 'success');
	}

	function handleUserUpdated(event: CustomEvent) {
		const updatedUser = event.detail;
		users = users.map((user) => (user.id === updatedUser.id ? updatedUser : user));
		filterUsers();
		showToast('User updated successfully', 'success');
	}

	function handleUserDeleted(event: CustomEvent) {
		const deletedUserId = event.detail;
		users = users.filter((user) => user.id !== deletedUserId);
		filterUsers();
		showToast('User deleted successfully', 'success');
	}

	function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning') {
		toastProps = { show: true, message, type };
		setTimeout(() => {
			toastProps = { ...toastProps, show: false };
		}, 3000);
	}

	function handleOpenUser() {
		if (supabaseReady) {
			current_user = null;
			openUser = true;
		} else {
			console.error('Supabase client is not ready');
			showToast('Unable to open user form. Please try again later.', 'error');
		}
	}

	function handleEditUser(user: any) {
		current_user = user;
		openUser = true;
	}

	function handleDeleteUser(userId: string) {
		userToDelete = userId;
		openDelete = true;
	}
</script>

<MetaTag {path} {description} {title} {subtitle} />

<main class="relative h-full w-full overflow-y-auto">
	<Toast {...toastProps} />

	<div class="p-8">
		<Heading tag="h1" class="mb-4 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
			All Agents
		</Heading>

		<div class="flex flex-wrap items-center justify-between gap-4 py-2">
			<div class="flex flex-1 items-center gap-4">
				<Input
					placeholder="Search for users"
					class="w-full max-w-lg rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:ring-indigo-400"
					bind:value={searchQuery}
					on:input={filterUsers}
				/>
				<Select
					placeholder="Filter by role"
					class="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:ring-indigo-400"
					bind:value={selectedRole}
					on:change={filterUsers}
				>
					<option value="">All Roles</option>
					<option value="Agent">Agent</option>
					{#if loggedInUser && loggedInUser.role === 'National_Admin'}
						<option value="Regional_Admin">Regional Admin</option>
					{/if}
					{#if loggedInUser && loggedInUser.role === 'National_Admin'}
						<option value="National_Admin">National Admin</option>
					{/if}
				</Select>
				<Select
					placeholder="Filter by region"
					class="me-4 w-80 border xl:w-96"
					bind:value={selectedRegion}
					on:change={filterUsers}
					disabled={loggedInUser && loggedInUser.role !== 'National_Admin'}
				>
					<option value="">All Regions</option>
					{#each regions as region}
						<option value={region}>{formatRegionName(region)}</option>
					{/each}
				</Select>
			</div>

			<Button
				size="sm"
				class="flex items-center gap-2 whitespace-nowrap rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
				on:click={handleOpenUser}
			>
				<PlusOutline size="sm" />Add user
			</Button>
		</div>

		{#if isLoading}
			<div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
				<img src={spinner} alt="Loading..." class="h-1/2 w-1/3" />
			</div>
		{:else if paginatedUsers.length === 0}
			<div
				class="mt-1 rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
			>
				<div class="flex flex-col items-center gap-8 md:flex-row">
					<div class="flex w-full items-center justify-center md:w-1/2">
						<img src={no_user} alt="No users illustration" class="h-1/2 w-1/2" />
					</div>
					<div class="w-full md:w-1/2">
						<h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">No users found</h2>
						<p class="mb-6 text-gray-600 dark:text-gray-300">
							Your user database is currently empty. Let's get started by creating your user
							profile!
						</p>
						<ol class="mb-6 list-decimal space-y-2 pl-5 text-gray-600 dark:text-gray-300">
							<li>Click the "Create user" button</li>
							<li>Fill in the user's details in the form</li>
							<li>Save the new user profile</li>
						</ol>
						<p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
							Once users are added, they'll appear in a table on this page, where you can manage and
							edit all user profiles.
						</p>
					</div>
				</div>
			</div>
		{:else}
			<UserList
				users={paginatedUsers}
				onEditUser={handleEditUser}
				onDeleteUser={handleDeleteUser}
			/>
			<div class="mt-4 flex justify-between">
				<Button color="blue" on:click={handlePreviousPage} disabled={currentPage === 1}>
					Previous
				</Button>
				<span class="text-gray-400"
					>Page {currentPage} of {Math.ceil(filteredUsers.length / itemsPerPage)}</span
				>
				<Button
					color="blue"
					on:click={handleNextPage}
					disabled={currentPage * itemsPerPage >= filteredUsers.length}
				>
					Next
				</Button>
			</div>
		{/if}
	</div>
</main>

<User
	bind:open={openUser}
	{current_user}
	selectedRegionId={current_user?.region_id}
	{data}
	on:userAdded={handleUserAdded}
	on:userUpdated={handleUserUpdated}
/>
<Delete bind:open={openDelete} userId={userToDelete} {data} on:userDeleted={handleUserDeleted} />
