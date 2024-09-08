<script lang="ts">
	import {
		Table,
		TableHead,
		TableBody,
		TableHeadCell,
		TableBodyRow,
		TableBodyCell,
		Avatar,
		Button
	} from 'flowbite-svelte';
	import { EditOutline, TrashBinSolid } from 'flowbite-svelte-icons';
	import { imagesPath } from '../../../utils/variables';

	export let users: any[];
	export let onEditUser: (user: any) => void;
	export let onDeleteUser: (userId: string) => void;

	function formatRegionName(regionName: string | null | undefined): string {
		if (!regionName) return 'N/A';
		return regionName.replace(
			/^(Region\s)0*(\d+)$/,
			(_, prefix, number) => `${prefix}${parseInt(number)}`
		);
	}

	function getStatusColor(is_online: boolean) {
		return is_online ? 'green' : 'gray';
	}

	function getStatusText(is_online: boolean) {
		return is_online ? 'Online' : 'Offline';
	}
</script>

<div class="flex flex-col" style="block-size: 45rem;">
	<div class="flex-grow overflow-x-auto">
		<Table class="h-full select-none">
			<TableHead class="sticky top-0 bg-gray-100 dark:bg-gray-700">
				<TableHeadCell class="w-1/4 p-4">Name</TableHeadCell>
				<TableHeadCell class="w-1/6 p-4">Status</TableHeadCell>
				<TableHeadCell class="w-1/6 p-4">Date Added</TableHeadCell>
				<TableHeadCell class="w-1/6 p-4">Role</TableHeadCell>
				<TableHeadCell class="w-1/6 p-4">Region</TableHeadCell>
				<TableHeadCell class="w-1/6 p-4">Actions</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each users as user}
					<TableBodyRow class="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-600">
						<TableBodyCell class="w-1/4 p-4">
							<div class="flex items-center space-x-3">
								<Avatar
									src={user.photo_url || imagesPath('default-avatar.png', 'users')}
									alt="User avatar"
									class="h-10 w-10 rounded-full"
								/>
								<div>
									<div class="font-semibold">{user.inspector_name}</div>
									<div class="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
								</div>
							</div>
						</TableBodyCell>
						<TableBodyCell class="w-1/6 p-4">
							<div class="flex items-center">
								<div
									class={`h-2.5 w-2.5 rounded-full bg-${getStatusColor(user.is_online)}-500 mr-2`}
								></div>
								{getStatusText(user.is_online)}
							</div>
						</TableBodyCell>
						<TableBodyCell class="w-1/6 p-4">
							{new Date(user.created_at).toLocaleDateString()}
						</TableBodyCell>
						<TableBodyCell class="w-1/6 p-4">
							{user.role}
						</TableBodyCell>
						<TableBodyCell class="w-1/6 p-4">
							{formatRegionName(user.regions?.region_name)}
						</TableBodyCell>
						<TableBodyCell class="w-1/6 p-4">
							<div class="flex space-x-2">
								<Button size="xs" color="blue" on:click={() => onEditUser(user)}>
									<EditOutline class="mr-1 h-4 w-4" /> Edit
								</Button>
								<Button size="xs" color="red" on:click={() => onDeleteUser(user.id)}>
									<TrashBinSolid class="mr-1 h-4 w-4" /> Delete
								</Button>
							</div>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	</div>
</div>
