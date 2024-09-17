<script lang="ts">
	import { Button } from 'flowbite-svelte';

	export let title = 'Sign in to platform';

	export let site = {
		name: 'PCIC Portal',
		img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Philippine_Crop_Insurance_Corporation_%28PCIC%29.svg/432px-Philippine_Crop_Insurance_Corporation_%28PCIC%29.svg.png",
		link: '/',
		imgAlt: 'PCIC Logo'
	};

	export let loginTitle = 'Login to your account';

	export let handleSubmit: any = null;
</script>

<main
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4 dark:from-gray-900 dark:to-gray-800"
>
	<div class="w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800">
		<div class="flex flex-col md:flex-row">
			<div class="flex w-full flex-col items-center justify-center bg-green-600 p-8 md:w-1/2">
				<div class="mb-8 flex items-center justify-center">
					<img src={site.img} class="mr-3 h-16" alt={site.imgAlt} />
				</div>
				<h2 class="text-center text-3xl font-bold text-white">{site.name}</h2>
			</div>
			<div class="w-full p-8 md:w-1/2">
				<h1 class="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
					{title}
				</h1>
				<form method="POST" class="space-y-6" on:submit={handleSubmit}>
					<slot />
					<Button
						type="submit"
						class="w-full rounded-md bg-green-600 px-4 py-3 font-bold text-white transition duration-300 ease-in-out hover:bg-green-700"
						>{loginTitle}</Button
					>
				</form>
			</div>
		</div>
	</div>
</main>
