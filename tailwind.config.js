const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig } */
module.exports = {
	content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
	darkMode: 'class',
	theme: {
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
			},
			colors: {
				gray: {
					150: 'rgb(242, 242, 243)'
				},
				cell: {
					blue: {
						primary: 'hsl(207, 90%, 61%)',
						secondary: 'hsl(207, 82%, 58%)'
					},
					red: {
						primary: 'hsl(7, 77%, 55%)',
						secondary: 'hsl(7, 70%, 50%)'
					}
				}
			}
		}
	},
	plugins: [
		require('@tailwindcss/forms'),
	],
};