// @ts-check
/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = /** @type {import("eslint").Linter.BaseConfig} */ ({
	root: true,
	env: {
		'es2022': true,
		'node': true
	},
	extends: [
		'eslint:recommended',
		'plugin:vue/vue3-essential',
		'@vue/eslint-config-typescript/recommended'
	],
	rules: {
		"@typescript-eslint/ban-ts-comment": [1, {
			'ts-expect-error': 'allow-with-description',
			'ts-ignore': 'allow-with-description',
			'ts-nocheck': 'allow-with-description',
			'ts-check': false,
			minimumDescriptionLength: 10
		}],
		"no-undef": 'off'
	},
});