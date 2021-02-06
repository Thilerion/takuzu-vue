import upperFirst from 'lodash.upperfirst';
import camelCase from 'lodash.camelcase';

export function registerGlobalComponents(app) {
	const files = require.context('./', true, /\.vue$/i);
	files.keys().forEach(fileName => {

		const componentConfig = files(fileName);
		const componentName = upperFirst(
			camelCase(
				fileName.replace(/^\.\/(.*)\.\w+$/, '$1')
			)
		);

		console.log({ fileName, componentName });
		app.component(componentName, componentConfig.default || componentConfig);
	})
}