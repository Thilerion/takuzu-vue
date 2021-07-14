const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
	purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}', './public/index.html'],
	darkMode: 'class', // or 'media' or 'class'
	mode: "jit",
	theme: {
		colors: {
			...colors,
			current: 'currentColor',
			one: {
				primary: '#e54934',
				dark: '#d2402d',
			},
			zero: {
				primary: '#42a5f5',
				dark: '#1f89e5',
			},
		},
		fontFamily: {
			'sans': [
				'Roboto',
				...defaultTheme.fontFamily.sans,
			],
			'number': [
				'Hammersmith One',
				'sans-serif'
			]
		},
		screens: {
			'sm': '640px',
			'md': '810px',
			'lg': '1024px',
			'hover-hover': { 'raw': '(hover: hover)' },
			'hover-none': { 'raw': '(hover: none)' },
		},
		extend: {
			fontSize: {
				'xxs': ['0.625rem', '0.875rem'],
			}
		}
	},
	plugins: [
		require('@tailwindcss/forms')
	]
}
