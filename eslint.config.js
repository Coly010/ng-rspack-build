const nx = require('@nx/eslint-plugin');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
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
    rules: {},
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
  }
);
