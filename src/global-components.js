export function registerGlobalComponents(app) {
	const globalComponents = import.meta.globEager('./components/global/**/*.vue');

	Object.entries(globalComponents).forEach(([path, definition]) => {
		const name = path.split('/').pop().replace(/\.\w+$/, '');
		
		app.component(name, definition.default);
	})
}