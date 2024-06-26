import { VitePWAOptions } from "vite-plugin-pwa";

export const createVitePwaConfig = ({
	name = 'Takuzu Vue',
	short_name = 'Takuzu Vue'
}): Partial<VitePWAOptions> => {
	const config: Partial<VitePWAOptions> = {
		includeAssets: ['favicon.ico', 'robots.txt', 'safari-pinned-tab.svg', 'apple-touch-icon.png', '**/*.{woff,woff2}'],
		manifest: {
			name,
			short_name,
			description: 'Binary logic puzzle, also called takuzu or binairo.',
			theme_color: "#4DBA87",
			orientation: 'portrait-primary',
			background_color: '#f8fafc',
			icons: [
				{
					"src": "/android-chrome-192x192.png",
					"sizes": "192x192",
					"type": "image/png"
				},
				{
					"src": "/android-chrome-512x512.png",
					"sizes": "512x512",
					"type": "image/png"
				},
				{
					"src": "/android-chrome-maskable-192x192.png",
					"sizes": "192x192",
					"type": "image/png",
					"purpose": "maskable"
				},
				{
					"src": "/android-chrome-maskable-512x512.png",
					"sizes": "512x512",
					"type": "image/png",
					"purpose": "maskable"
				}
			]
		},
	}
	return config;
}