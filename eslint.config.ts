import tsEslint from 'typescript-eslint'
import eslint from '@eslint/js'

export default [
    {
        ignores: [
            '.idea/',
            '.github/',
            'dist/',
            'node_modules/',
            'test/',
        ],
    },
    eslint.configs.recommended,
    ...tsEslint.configs.recommended,
    {
        files: ['**/*.{ts,js}'],
        rules: {
            indent: ['error', 4, { SwitchCase: 1 }],
            'quote-props': ['error', 'as-needed'],
            'no-cond-assign': 'off',
            'no-console': 'off',
            'no-control-regex': 'off',
            semi: ['error', 'never'],
            '@typescript-eslint/no-unused-vars': ['error', {
                args: "all",
                argsIgnorePattern: "^_",
                caughtErrors: "all",
                caughtErrorsIgnorePattern: "^_",
                destructuredArrayIgnorePattern: "^_",
                varsIgnorePattern: "^_",
                ignoreRestSiblings: true,
            }],
            '@typescript-eslint/no-empty-object-type': 'off',
        },
    },
]
