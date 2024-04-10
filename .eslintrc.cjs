// @ts-check
/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

/**
 * @type {import("eslint").Linter.Config}
 */
const config = {
	root: true,
	env: {
		"es2024": true,
		"node": true,
		"browser": true
	},
	extends: [
		"eslint:recommended",
		"plugin:vue/vue3-essential",
		"@vue/eslint-config-typescript/recommended"
	],
	parserOptions: {
		ecmaVersion: "latest"
	},
	rules: {
		"@typescript-eslint/ban-ts-comment": [1, {
			"ts-expect-error": "allow-with-description",
			"ts-ignore": "allow-with-description",
			"ts-nocheck": "allow-with-description",
			"ts-check": false,
			minimumDescriptionLength: 10
		}],
		"@typescript-eslint/no-unused-vars": ["error", { "ignoreRestSiblings": true, "varsIgnorePattern": "(^(props|emit)$)|(^_)" }],
		"@typescript-eslint/no-non-null-assertion": 0,
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/array-type": ["warn", { "default": "array", "readonly": "generic" }],

		"no-empty": ["error", { "allowEmptyCatch": true }],
		"no-undef": "off",
		"no-unused-vars": "off",
		"prefer-const": ["error", {"destructuring": "all"}],
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