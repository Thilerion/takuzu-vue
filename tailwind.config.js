const colors = require('tailwindcss/colors');

module.exports = {
	purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}', './public/index.html'],
	darkMode: 'class', // or 'media' or 'class'
	theme: {
		extend: {
			colors: {
				gray: colors.gray,
				truegray: colors.trueGray,
				bluegray: colors.blueGray,
				coolgray: colors.coolGray,
				warmgray: colors.warmGray,
				teal: colors.teal,
			}
		},
		fontFamily: {
			'sans': [
				'Roboto',
				'ui-sans-serif',
				'system-ui',
				'-apple-system',
				'BlinkMacSystemFont',
				'"Segoe UI"',
				'"Helvetica Neue"',
				'sans-serif',
				'"Apple Color Emoji"',
				'"Segoe UI Emoji"',
				'"Segoe UI Symbol"',
				'"Noto Color Emoji"',
			],
			'number': [
				'Hammersmith One',
				'sans-serif'
			]
		}
	},
	variants: {
		extend: {
			backgroundColor: ['active']
		},
	},
	plugins: [],
}
