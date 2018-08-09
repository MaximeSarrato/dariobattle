module.exports = {
	env: {
		browser: true,
		commonjs: true,
		es6: true,
		node: true
	},
	parserOptions: {
		ecmaVersion: 8
	},
	extends: 'eslint:recommended',
	rules: {
		indent: ['error', 2],
		'linebreak-style': ['error', 'unix'],
		quotes: ['error', 'single'],
		semi: ['error', 'always'],
		'no-console': 0,
		'no-undef': 2,
		'no-unused-vars': 2,
		'no-var': ['error'],
		'prefer-const': [
			'warn',
			{
				destructuring: 'any',
				ignoreReadBeforeAssign: false
			}
		],
		'arrow-body-style': ['error', 'as-needed'],
		'arrow-parens': ['error', 'as-needed'],
		'spaced-comment': ['error', 'always']
	}
};
