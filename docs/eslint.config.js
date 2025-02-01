import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

import typescriptEslint from '@typescript-eslint/eslint-plugin';
import svelteParser from 'svelte-eslint-parser';

export default ts.config(
    js.configs.recommended,
    ...svelte.configs['flat/recommended'],
    ...ts.configs.recommended,
    prettier,
    ...svelte.configs['flat/prettier'],
    {
        files: ['**/*.svelte', '**/*.ts', '**/*.js'],
        ignores: ['eslint.config.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                Atomics: 'readonly',
                SharedArrayBuffer: 'readonly'
            },
            parser: svelteParser,
            parserOptions: {
                parser: '@typescript-eslint/parser',
                project: './tsconfig.json',
                ecmaVersion: 11,
                sourceType: 'module',
                extraFileExtensions: ['.svelte']
            },
            ecmaVersion: 11,
            sourceType: 'module'
        },
        plugins: {
            '@typescript-eslint': typescriptEslint,
            svelte
        },
        processor: 'svelte/svelte',
        rules: {},
    }
);