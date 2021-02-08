import upperFirst from 'lodash.upperfirst';
import camelCase from 'lodash.camelcase';

export function registerGlobalComponents(app) {
	const files = require.context('./', true, /\.vue$/i);
	files.keys().forEach(fileName => {

		const componentConfig = files(fileName);
		const regex = new RegExp(/[^\\\/]+(?=\.[\w]+$)|[^\\\/]+$/g);
		const baseFileName = regex.exec(fileName)[0];
		const componentName = upperFirst(
			camelCase(
				baseFileName
			)
		);

		console.log({ fileName, componentName });
		app.component(componentName, componentConfig.default || componentConfig);
	})
}