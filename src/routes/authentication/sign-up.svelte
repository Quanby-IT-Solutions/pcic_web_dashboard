<script lang="ts">
	import { Label, Input } from 'flowbite-svelte';

	import SignUp from '$lib/utils/authentication/SignUp.svelte';
	import MetaTag from '$lib/utils/general/MetaTag.svelte';

	const title = 'Create a Free Account';
	const site = {
		name: 'PCIC Web Dashboard',
		img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Philippine_Crop_Insurance_Corporation_%28PCIC%29.svg/432px-Philippine_Crop_Insurance_Corporation_%28PCIC%29.svg.png",
		link: '/',
		imgAlt: 'PCIC Logo'
	};
	const acceptTerms = true;
	const haveAccount = true;
	const btnTitle = 'Create account';
	const termsLink = '/';
	const loginLink = 'sign-in';
	const labelClass = 'space-y-2 dark:text-white';
	const onSubmit = (e: Event) => {
		const formData = new FormData(e.target as HTMLFormElement);

		const data: Record<string, string | File> = {};
		for (const field of formData.entries()) {
			const [key, value] = field;
			data[key] = value;
		}
		console.log(data);
	};

	const path: string = '/authentication/sign-up';
	const description: string = 'Sign up PCIC Web Dashboard';
	const metaTitle: string = 'PCIC Web Dashboard - Sign up';
	const subtitle: string = 'Sign up';
</script>

<MetaTag {path} {description} title={metaTitle} {subtitle} />

<SignUp
	{title}
	{site}
	{acceptTerms}
	{haveAccount}
	{btnTitle}
	{termsLink}
	{loginLink}
	on:submit={onSubmit}
>
	<div>
		<Label class={labelClass}>
			<span>Your email</span>
			<Input
				type="email"
				name="email"
				placeholder="name@company.com"
				required
				class="border outline-none dark:border-gray-600 dark:bg-gray-700"
			/>
		</Label>
	</div>
	<div>
		<Label class={labelClass}>
			<span>Your password</span>
			<Input
				type="password"
				name="password"
				placeholder="••••••••"
				required
				class="border outline-none dark:border-gray-600 dark:bg-gray-700"
			/>
		</Label>
	</div>
	<div>
		<Label class={labelClass}>
			<span>Confirm password</span>
			<Input
				type="password"
				name="confirm-password"
				placeholder="••••••••"
				required
				class="border outline-none dark:border-gray-600 dark:bg-gray-700"
			/>
		</Label>
	</div>
</SignUp>
