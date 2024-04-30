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
		'plugin:@typescript-eslint/recommended',
		"plugin:vue/vue3-recommended",
		"@vue/eslint-config-typescript/recommended"
	],
	parser: "vue-eslint-parser",
	parserOptions: {
		ecmaVersion: "latest",
		parser: "@typescript-eslint/parser",
		sourceType: "module",
	},
	plugins: [
		"vue",
		"@typescript-eslint"
	],
	rules: {
		"@typescript-eslint/ban-ts-comment": [1, {
			"ts-expect-error": "allow-with-description",
			"ts-ignore": "allow-with-description",
			"ts-nocheck": "allow-with-description",
			"ts-check": false,
			minimumDescriptionLength: 10
		}],
		"@typescript-eslint/method-signature-style": [
			"error",
			"property"
		],
		"@typescript-eslint/no-unused-vars": ["error", { "ignoreRestSiblings": true, "varsIgnorePattern": "(^(props|emit)$)|(^_)" }],
		"@typescript-eslint/no-non-null-assertion": 0,
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/array-type": ["warn", { "default": "array", "readonly": "generic" }],

		"no-empty": ["error", { "allowEmptyCatch": true }],
		"no-undef": "off",
		"no-unused-vars": "off",
		"prefer-const": ["error", {"destructuring": "all"}],
		"vue/html-indent": [
			"warn", "tab", {
				"baseIndent": 0,				
			}
		],
		"vue/multiline-html-element-content-newline": 0,
		"vue/singleline-html-element-content-newline": 0,
		"vue/max-attributes-per-line": ["warn", {
			"singleline": {
				"max": 2
			},
			"multiline": {
				"max": 1,
			}
		}],
		"vue/v-on-event-hyphenation": ["warn", "always", {
			"autofix": false,
			"ignore": ["update:modelValue"]
		}],
		"vue/attribute-hyphenation": 0,
		"vue/html-self-closing": ["warn", {
			"html": {
				"void": "never",
				"normal": "any",
				"component": "always"
			}
		}]
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