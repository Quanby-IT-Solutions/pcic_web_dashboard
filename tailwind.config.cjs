/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
	content: [
		'./src/**/*.{html,js,svelte,ts,md}',
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
	],
	theme: {
		fontFamily: {
			sans: ['Inter', ...defaultTheme.fontFamily.sans]
		},
		extend: {
			colors: {
				primary: {
					50: '#f3faf7',
					100: '#def7ec',
					200: '#bcf0da',
					300: '#84e1bc',
					400: '#31c48d',
					500: '#00A651',
					600: '#057a55',
					700: '#046c4e',
					800: '#03543f',
					900: '#014737'
				}
			}
		}
	},
	plugins: [require('flowbite/plugin')({ charts: true })],
	darkMode: 'class'
	// Remove the safelist if you're not using these classes
	// safelist: [
	//   {
	//     pattern: /^datatable-.*$/,
	//   },
	// ],
};
