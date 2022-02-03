export const vitePwaConfig = {
	registerType: 'autoUpdate',
	includeAssets: ['favicon.ico', 'robots.txt', 'safari-pinned-tab.svg', 'apple-touch-icon.png'],
	manifest: {
		name: 'Takuzu Vue',
		short_name: 'Takuzu Vue',
		description: 'Description of your app',
		theme_color: "#4DBA87",
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
	}
};