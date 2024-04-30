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
		"@typescript-eslint/array-type": [
			1,
			{
				"default": "array",
				"readonly": "generic"
			}
		],
		"@typescript-eslint/ban-ts-comment": [
			1,
			{
				"minimumDescriptionLength": 10,
				"ts-check": false,
				"ts-expect-error": "allow-with-description",
				"ts-ignore": "allow-with-description",
				"ts-nocheck": "allow-with-description"
			}
		],
		"@typescript-eslint/method-signature-style": [
			2,
			"property"
		],
		"@typescript-eslint/no-explicit-any": 0,
		"@typescript-eslint/no-non-null-assertion": 0,
		"@typescript-eslint/no-unused-vars": [
			2,
			{
				"ignoreRestSiblings": true,
				"varsIgnorePattern": "(^(props|emit)$)|(^_)"
			}
		],
	
		"no-empty": [
			2,
			{
				"allowEmptyCatch": true
			}
		],
		"no-undef": 0,
		"no-unused-vars": 0,
		"prefer-const": [
			2,
			{
				"destructuring": "all"
			}
		],
		
		"vue/attribute-hyphenation": 0,
		"vue/html-indent": [
			1,
			"tab",
			{
				"baseIndent": 0,
				"alignAttributesVertically": true
			}
		],
		"vue/html-self-closing": [
			1,
			{
				"html": {
					"component": "always",
					"normal": "any",
					"void": "never"
				}
			}
		],
		"vue/max-attributes-per-line": [
			1,
			{
				"multiline": {
					"max": 1
				},
				"singleline": {
					"max": 2
				}
			}
		],
		"vue/multiline-html-element-content-newline": 0,
		"vue/no-duplicate-attr-inheritance": 1,
		"vue/no-empty-component-block": 1,
		"vue/singleline-html-element-content-newline": 0,
		"vue/v-on-event-hyphenation": [
			1,
			"always",
			{
				"autofix": false,
				"ignore": [
					"update:modelValue"
				]
			}
		],
		"vue/require-typed-ref": 1
	},
	"overrides": [
		{
			"files": ["tests/**/*.{spec,test}.{ts,js}"],
			"rules": {
				"@typescript-eslint/ban-ts-comment": 0
			}
		}
	]
}

module.exports = config;