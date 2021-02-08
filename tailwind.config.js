const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
	purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}', './public/index.html'],
	darkMode: 'class', // or 'media' or 'class'
	theme: {
		colors: {
			transparent: colors.transparent,
			current: colors.current,
			black: colors.black,
			white: colors.white,
			gray: colors.gray,
			truegray: colors.trueGray,
			teal: colors.teal,
			yellow: {
				'400': colors.yellow[400],
				'500': colors.yellow[500],
			},
			red: colors.red,
			blue: colors.blue,
			green: colors.green,

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
		}
	},
	variants: {
		extend: {
			backgroundColor: ['active'],
			borderWidth: ['active'],
			borderColor: ['active'],
			outline: ['focus-visible', 'active'],
			ringWidth: ['focus-visible', 'active'],
			ringOpacity: ['focus-visible', 'active'],
		},
	},
	plugins: [
		require('@tailwindcss/forms')
	],
	corePlugins: {
		float: false,
		backgroundAttachment: false,
		backgroundClip: false,
		backgroundAttachment: false,
		borderCollapse: false,
		clear: false,
	}
}
