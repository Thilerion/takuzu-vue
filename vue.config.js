const WorkerPlugin = require('worker-plugin');

const packageAppVersion = require('./package.json').version;
process.env.VUE_APP_VERSION = packageAppVersion;

module.exports = {
	configureWebpack: {
		output: {
			globalObject: 'this'
		},
		plugins: [
			new WorkerPlugin()
		]
	},
}