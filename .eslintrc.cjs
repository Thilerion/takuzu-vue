// @ts-check
/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

/**
 * @type {import("eslint").Linter.Config}
 */
const config = {
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
		"no-undef": 'off',
		"no-unused-vars": 'off',
		"@typescript-eslint/no-unused-vars": ["error", { "ignoreRestSiblings": true, "varsIgnorePattern": "^(props|emit)$" }],
		"prefer-const": ["error", {"destructuring": "all"}],
		"@typescript-eslint/no-non-null-assertion": 0,
		"@typescript-eslint/no-explicit-any": ["warn", { "ignoreRestArgs": true }],
		"no-empty": ["error", { "allowEmptyCatch": true }],
	},
	"overrides": [
		{
			"files": ["tests/**/*.{spec,test}.{ts,js}"],
			"rules": {
				"@typescript-eslint/ban-ts-comment": "off"
			}
		}
	]
}

module.exports = config;