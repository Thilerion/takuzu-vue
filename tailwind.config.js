const colors = require('tailwindcss/colors');

module.exports = {
	purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}', './public/index.html'],
	darkMode: 'class', // or 'media' or 'class'
	theme: {
		extend: {},
		colors: {
			transparent: 'transparent',
			current: 'currentColor',
			black: colors.black,
			white: colors.white,
			yellow: colors.yellow,

			gray: colors.gray,
			truegray: colors.trueGray,
			bluegray: colors.blueGray,
			coolgray: colors.coolGray,
			warmgray: colors.warmGray,

			teal: colors.teal
		}
	},
	variants: {
		extend: {
			backgroundColor: ['active']
		},
	},
	plugins: [],
}
