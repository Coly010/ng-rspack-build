const nx = require('@nx/eslint-plugin');
const tseslint = require('typescript-eslint');
const { default: node } = require('@code-pushup/eslint-config/node.js');
const {
  default: typescript,
} = require('@code-pushup/eslint-config/typescript.js');

module.exports = tseslint.config([
  ...typescript,
  ...node,
  {
    files: ['**/*.json'],
    // Override or add rules here
    rules: {},
    languageOptions: { parser: require('jsonc-eslint-parser') },
  },
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {
      'unicorn/prefer-ternary': 'warn',
    },
  },
  {
    ignores: [
      '**/*.d.ts',
      '**/*.d.ts.map',
      '**/dist',
      '**/*.mock.*',
      '**/code-pushup.config.ts',
      '**/mocks/fixtures/**',
      '**/__snapshots__/**',
      '**/dist',
      '**/*.md',
    ],
  },
]);
