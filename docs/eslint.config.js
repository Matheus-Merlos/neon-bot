import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

import { FlatCompat } from '@eslint/eslintrc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    ...compat.extends(
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'plugin:svelte/recommended'
    ),
    js.configs.recommended,
    ...ts.configs.recommended,
    ...svelte.configs['flat/recommended'],
    prettier,
    ...svelte.configs['flat/prettier'],
    {
        plugins: {
            '@typescript-eslint': typescriptEslint,
            svelte: svelte
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                Atomics: 'readonly',
                SharedArrayBuffer: 'readonly'
            },

            parser: tsParser,
            ecmaVersion: 11,
            sourceType: 'module'
        },

        rules: {},

        files: ['*.svelte', '*.ts', '*.tsx', '*.js'],
        processor: 'svelte/svelte',

        settings: {
            'svelte/ignore-styles': () => true // Ignorar estilos se necessário
        },

        ignores: ['node_modules/', '.svelte-kit/']
    }
];
