// @ts-check
import plugin from 'tailwindcss/plugin.js';
import tailwindcssForms from '@tailwindcss/forms';
import tailwindcssTypography from '@tailwindcss/typography';
import colors from 'tailwindcss/colors.js';

/** @type {import('tailwindcss').Config} */
const config = {
	content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
	darkMode: 'class',
	theme: {
		fontFamily: {
			'sans': [
				'Roboto',
				'sans-serif',
			],
			'number': [
				'Hammersmith One',
				'sans-serif'
			],
			'mono': ['monospace']
		},
		screens: {
			'sm': '576px',
			'md': '768px',
			'lg': '1024px',
			'hover-hover': { 'raw': '(hover: hover) and (pointer: fine)' },
			'hover-none': { 'raw': '(pointer: coarse)' },
		},
		extend: {
			typography: (/* { theme } */) => ({
				slate: {
					'--tw-prose-invert-body': colors.slate[200],
					'--tw-prose-invert-bullets': colors.slate[400],
					'--tw-prose-invert-counters': colors.slate[300]
				}
			}),
			fontSize: {
				'xxs': ['0.625rem', '0.875rem'],
			},
			height: {
				'vh': 'var(--vh-total)'
			},
			maxHeight: {
				'vh': 'var(--vh-total)'
			},
			minHeight: {
				'vh': 'var(--vh-total)'
			},
			colors: {
				gray: {
					125: 'rgb(242, 242, 243)',
					150: 'rgb(234, 234, 235)'
				},
				slate: {
					775: 'rgb(38, 52, 75)'
				},
				cell: {
					blue: {
						primary: 'hsl(207, 90%, 61%)',
						primaryDark: 'hsl(207, 85%, 65%)',
						dark: 'hsl(207, 70%, 55%)',
						light: 'hsl(207, 80%, 66%)',
						lighter: 'hsl(207, 80%, 76%)',
					},
					red: {
						primary: 'hsl(7, 77%, 55%)',
						primaryDark: 'hsl(7, 65%, 65%)',
						dark: 'hsl(7, 50%, 47%)',
						light: 'hsl(7, 70%, 59%)',
						lighter: 'hsl(7, 70%, 69%)'
					}
				}
			}
		}
	},
	plugins: [
		tailwindcssForms(),
		tailwindcssTypography(),
		plugin(function ({ addVariant }) {
			// notouch data attributes are set by useDetectTouch composable, based on pointerType from last interaction
			addVariant('hover-notouch', '[data-last-touch="false"] &:hover');
			addVariant('focus-notouch', '[data-last-touch="false"] &:focus');
			addVariant('hocus-notouch', [
				'[data-last-touch="false"] &:focus',
				'[data-last-touch="false"] &:hover',
			]);
			addVariant('hocus', ['&:hover', '&:focus']);
		})
	],
}

export default config;