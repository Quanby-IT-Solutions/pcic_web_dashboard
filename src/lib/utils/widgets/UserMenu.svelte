<script lang="ts">
	import { onMount } from 'svelte';
	import { Avatar, Dropdown, DropdownHeader, DropdownItem } from 'flowbite-svelte';

	export let name: string = ''; // "sample sample",
	export let avatar: string = ''; // "sample-sample.png",
	export let email: string = ''; // "sample.sample@pcic.com",
	export let signOut: any;
	export let data;
	$: ({ supabase } = data);

	onMount(async () => {
		const userId = (await supabase.auth.getUser()).data.user.id;
		console.log(userId);
		const { data, error } = await supabase
			.from('users')
			.select(
				`
                    *
                `
			)
			.eq('auth_user_id', userId)
			.single();
		if (error) {
			console.log(error);
			return;
		}
		name = data.inspector_name;
		email = data.email;
		avatar = data.photo_url;
	});
</script>

<button class="ms-3 rounded-full ring-gray-400 focus:ring-4 dark:ring-gray-600">
	<Avatar size="sm" src={avatar} tabindex="0" />
</button>
<Dropdown placement="bottom-end">
	<DropdownHeader>
		<span class="block truncate text-sm font-medium">{email}</span>
	</DropdownHeader>
	<DropdownItem on:click={signOut}>Sign out</DropdownItem>
</Dropdown>
