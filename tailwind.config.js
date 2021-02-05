const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

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
				cyan: colors.cyan,
			}
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
		}
	},
	variants: {
		extend: {
			backgroundColor: ['active']
		},
	},
	plugins: [
		require('@tailwindcss/forms')
	],
}
