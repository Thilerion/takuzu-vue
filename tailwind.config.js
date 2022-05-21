const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig } */
module.exports = {
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
				cell: {
					blue: {
						primary: 'hsl(207, 90%, 61%)',
						secondary: 'hsl(207, 82%, 58%)'
					},
					blues: {
						...generateCellColorShades(
							[207, 90, 61],
							[-2, -4, 2, 4],
							[1, 3, -1, -3],
						)
					},
					reds: {
						...generateCellColorShades(
							[7, 77, 55],
							[0, 0, -2, -3],
							[2, 4, -1, -2]
						)
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

function generateCellColorShades([h, s, l], satDeltas = [], lightDeltas = []) {
	const base = HSLToRGB(h, s, l);
	const result = {
		DEFAULT: base,
		v0: base,
	};
	const length = Math.min(satDeltas.length, lightDeltas.length);
	for (let i = 0; i < length; i++) {
		const s2 = s + satDeltas[i];
		const l2 = l + lightDeltas[i];
		result[`v${i + 1}`] = HSLToRGB(h, s2, l2);
	}
	return result;
}

function HSLToRGB (h, s, l) {
	s /= 100;
	l /= 100;
	const k = n => (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	const f = n =>
	  l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
	const rgb = [255 * f(0), 255 * f(8), 255 * f(4)];
	return `rgb(${rgb.map(val => Math.round(val)).join(', ')})`;
};