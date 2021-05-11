const WorkerPlugin = require('worker-plugin');

const packageAppVersion = require('./package.json').version;
process.env.VUE_APP_VERSION = packageAppVersion;

module.exports = {
	configureWebpack: {
		output: {
			globalObject: 'self'
		},
		plugins: [
			new WorkerPlugin({
				filename: '[name].[hash:5].js',
				chunkFilename: '[name].[hash:5].js'
			})
		]
	},
}