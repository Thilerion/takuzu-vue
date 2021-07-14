const packageAppVersion = require('./package.json').version;
process.env.VUE_APP_VERSION = packageAppVersion;

module.exports = {
	configureWebpack: {
		output: {
			globalObject: 'self'
		},
	},
}