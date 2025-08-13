import js from '@eslint/js';
import ts from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import pluginQuery from '@tanstack/eslint-plugin-query';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  ...ts.configs.recommended,
  ...pluginQuery.configs['flat/recommended'],
  js.configs.recommended,
  pluginReact.configs.flat.recommended,
  prettier,

  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        ...globals.browser,
        chrome: true,
        __APP_VERSION__: 'readonly',
      },
    },
    rules: {
      ...ts.configs.recommendedTypeChecked.at(-1).rules,
      'react/react-in-jsx-scope': 'off',
    },
  },

  {
    files: ['*.js', '*.cjs', '*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  {
    ignores: ['build/', 'dist/', 'node_modules/', 'src/components/ui/*'],
  },
]);
