<script lang="ts">
	import { Label, Input, DarkMode } from 'flowbite-svelte';
	import { goto } from '$app/navigation';

	import logo from '$lib/assets/pcic.svg';

	import SignIn from '../utils/authentication/SignIn.svelte';
	import MetaTag from '../utils/MetaTag.svelte';
	import Toast from '../utils/widgets/Toast.svelte';

	let title = 'Sign in to Platform';
	let site = {
		name: 'PCIC Portal',
		img: logo,
		link: '/',
		imgAlt: 'PCIC Logo'
	};

	let toastProps = {
		show: false,
		message: '',
		type: 'success' as 'success' | 'error'
	};

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		try {
			const formData = new FormData(event.target as HTMLFormElement);
			const email = formData.get('email') as string;
			const password = formData.get('password') as string;

			const response = await fetch('?/signin', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: new URLSearchParams({ email, password }).toString()
			});

			if (!response.ok) throw new Error('Failed to sign in');

			const { message, success } = await response.json();
			showToast(message, success ? 'success' : 'error');

			if (success) {
				setTimeout(() => goto('/dashboard'), 1500);
			}
		} catch (error) {
			showToast('Error signing in. Please try again.', 'error');
		}
	};

	const showToast = (message: string, type: 'success' | 'error') => {
		toastProps = { show: true, message, type };
		setTimeout(() => {
			toastProps.show = false;
		}, 3000);
	};
</script>

<MetaTag
	path="/authentication/sign-in"
	description="Sign In - PCIC Web Dashboard"
	title="PCIC Web Dashboard"
	subtitle="Sign in"
/>

<div class="relative min-h-screen">
	<div class="absolute right-4 top-4 z-10">
		<DarkMode
			class="rounded-lg p-2.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
		/>
	</div>

	<SignIn {title} {site} loginTitle="Login to your account" on:submit={handleSubmit}>
		<div>
			<Label for="email" class="mb-2 dark:text-white">Your email</Label>
			<Input
				type="email"
				name="email"
				id="email"
				placeholder="username@pcic.com"
				required
				class="border outline-none dark:border-gray-600 dark:bg-gray-700"
			/>
		</div>
		<div>
			<Label for="password" class="mb-2 dark:text-white">Your password</Label>
			<Input
				type="password"
				name="password"
				id="password"
				placeholder="••••••••"
				required
				class="border outline-none dark:border-gray-600 dark:bg-gray-700"
			/>
		</div>
	</SignIn>
</div>

<Toast {...toastProps} />
