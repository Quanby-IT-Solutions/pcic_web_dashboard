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
	import { imagesPath } from '../variables';

	export let users: any[];
	export let onEditUser: (user: any) => void;
	export let onDeleteUser: (userId: string) => void;
	export let loggedInUserRole: string;


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



<div class="flex flex-col mt-6" style="block-size: 45rem;"
>
    <div class="overflow-x-auto">
        <Table class="min-w-full divide-y divide-gray-200">
            <TableHead class="bg-gray-100 dark:bg-gray-700">
                <TableHeadCell class="w-3/12 p-4 text-left align-middle">Name</TableHeadCell>
                <TableHeadCell class="w-1/12 p-4 text-center align-middle">Status</TableHeadCell>
                <TableHeadCell class="w-2/12 p-4 text-center align-middle">Date Added</TableHeadCell>
                <TableHeadCell class="w-2/12 p-4 text-center align-middle">Role</TableHeadCell>
                <TableHeadCell class="w-2/12 p-4 text-center align-middle">Region</TableHeadCell>
                {#if loggedInUserRole === 'National_Admin'}
                    <TableHeadCell class="w-2/12 p-4 text-center align-middle">Actions</TableHeadCell>
                {/if}
            </TableHead>
        </Table>
    </div>

    <div class="flex-grow overflow-y-auto" style="max-height: 70vh;">
        <Table class="min-w-full divide-y divide-gray-200">
            <TableBody>
                {#each users as user}
                    <TableBodyRow class="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <TableBodyCell class="w-3/12 p-4 text-left align-middle">
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
                        <TableBodyCell class="w-1/12 p-4 text-center align-middle">
                            <div class="flex items-center justify-center space-x-2">
                                <div
                                    class={`h-2.5 w-2.5 rounded-full ${
                                        user.is_online ? 'bg-green-500' : 'bg-gray-500'
                                    }`}
                                ></div>
                                <span>{getStatusText(user.is_online)}</span>
                            </div>
                        </TableBodyCell>
                        
                        <TableBodyCell class="w-2/12 p-4 text-center align-middle">
                            {new Date(user.created_at).toLocaleDateString()}
                        </TableBodyCell>
                        <TableBodyCell class="w-2/12 p-4 text-center align-middle">
                            {user.role}
                        </TableBodyCell>
                        <TableBodyCell class="w-2/12 p-4 text-center align-middle">
                            {formatRegionName(user.regions?.region_name)}
                        </TableBodyCell>
                        {#if loggedInUserRole === 'National_Admin'}
                            <TableBodyCell class="w-2/12 p-4 text-center align-middle">
                                <div class="flex items-center justify-center space-x-2">
                                    <Button size="xs" color="blue" on:click={() => onEditUser(user)}>
                                        <EditOutline class="mr-1 h-4 w-4" /> Edit
                                    </Button>
                                    <Button size="xs" color="red" on:click={() => onDeleteUser(user.id)}>
                                        <TrashBinSolid class="mr-1 h-4 w-4" /> Delete
                                    </Button>
                                </div>
                            </TableBodyCell>
                        {/if}
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    </div>
</div>