<script lang="ts">
	import { ChevronDownOutline } from 'flowbite-svelte-icons';

	import logo from '$lib/assets/pcic.svg';

	import '../../app.pcss';

	import UserMenu from '../utils/widgets/UserMenu.svelte';

	import {
		DarkMode,
		Dropdown,
		DropdownItem,
		NavBrand,
		NavHamburger,
		NavLi,
		NavUl,
		Navbar,
		Search
	} from 'flowbite-svelte';

	export let fluid = true;
	export let drawerHidden = false;
	export let list = false;
	export let signOut;
	export let data;

	let routes = [
		{ name: 'Dashboard', icon: 'ChartPieOutline', href: '/dashboard' },
		{ name: 'Users', icon: 'UserSettingsSolid', href: '/c/users' },
		{ name: 'Tasks', icon: 'FileWordSolid', href: '/c/tasks' }
	];

	let searchQuery = '';
	let filteredRoutes = routes;

	function handleSearch(event: Event) {
		const target = event.target as HTMLInputElement;
		searchQuery = target.value.toLowerCase();
		filteredRoutes = routes.filter((route) => route.name.toLowerCase().includes(searchQuery));
	}
</script>

<Navbar
	{fluid}
	class="border-b border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
	color="default"
	let:NavContainer
>
	<NavContainer class="mb-px mt-px px-1" {fluid}>
		<NavHamburger
			onClick={() => (drawerHidden = !drawerHidden)}
			class="m-0 me-3 text-gray-900 dark:text-gray-100 md:block lg:hidden"
		/>

		<NavBrand href="/" class={list ? 'w-40' : 'lg:w-60'}>
			<img src={logo} class="me-2.5 h-6 sm:h-8" alt="PCIC Logo" />
			<span
				class="ml-px self-center whitespace-nowrap text-xl font-semibold dark:text-gray-100 sm:text-2xl"
			>
				PCIC Portal
			</span>
		</NavBrand>

		<div class="relative hidden lg:block lg:ps-3">
			{#if list}
				<NavUl
					class="ml-2 text-gray-700 dark:text-gray-300"
					activeUrl="/"
					activeClass="text-primary-600 dark:text-primary-500"
				>
					<NavLi href="/">Home</NavLi>
					<NavLi href="#top">Messages</NavLi>
					<NavLi href="#top">Profile</NavLi>
					<NavLi href="#top">Settings</NavLi>
					<NavLi class="cursor-pointer">
						Dropdown
						<ChevronDownOutline class="ms-0 inline text-gray-700 dark:text-gray-300" />
					</NavLi>

					<Dropdown
						class="z-20 w-44 rounded-lg bg-white text-gray-700 shadow-lg dark:bg-gray-800 dark:text-gray-100"
					>
						<DropdownItem href="#top" class="hover:bg-gray-100 dark:hover:bg-gray-700">
							Item 1
						</DropdownItem>
						<DropdownItem href="#top" class="hover:bg-gray-100 dark:hover:bg-gray-700">
							Item 2
						</DropdownItem>
						<DropdownItem href="#top" class="hover:bg-gray-100 dark:hover:bg-gray-700">
							Item 3
						</DropdownItem>
					</Dropdown>
				</NavUl>
			{:else}
				<form>
					<Search
						size="md"
						class="mt-1 w-96 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-indigo-400"
						on:input={handleSearch}
					/>
					{#if searchQuery}
						<ul
							class="absolute mt-2 max-h-60 w-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
						>
							{#each filteredRoutes as route}
								<li class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
									<a href={route.href} class="flex items-center space-x-2">
										<span>{route.name}</span>
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				</form>
			{/if}
		</div>

		<div class="ms-auto flex items-center text-gray-500 dark:text-gray-400 sm:order-2">
			<DarkMode />
			<UserMenu {data} {signOut} />
		</div>
	</NavContainer>
</Navbar>
