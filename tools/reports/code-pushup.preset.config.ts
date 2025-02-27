import { CoreConfig } from '@code-pushup/models';
import eslintPlugin from '@code-pushup/eslint-plugin';
import coveragePlugin from '@code-pushup/coverage-plugin';
import * as process from 'node:process';
import { slugify } from '@code-pushup/utils';

export const baseConfig: CoreConfig = {
  plugins: [],
  ...(process.env.CP_API_KEY != null
    ? {
        upload: {
          server: 'https://api.staging.code-pushup.dev/graphql',
          apiKey: process.env.CP_API_KEY,
          organization: 'ng-rspack',
          project: slugify(process.env['NX_TASK_TARGET_PROJECT']),
        },
      }
    : {}),
};

export async function eslintConfig(projectName?: string): Promise<CoreConfig> {
  const name = projectName ?? process.env['NX_TASK_TARGET_PROJECT'];
  if (!name) {
    throw new Error('Project name is required');
  }
  return {
    plugins: [
      await eslintPlugin({
        patterns: `packages/${name}/**/*.ts`,
        eslintrc: `packages/${name}/eslint.next.config.js`,
      }),
    ],
    categories: [
      {
        slug: 'bug-prevention',
        title: 'Bug prevention',
        description: 'Lint rules that find **potential bugs** in your code.',
        refs: [
          { type: 'group', plugin: 'eslint', slug: 'problems', weight: 1 },
        ],
      },
      {
        slug: 'code-style',
        title: 'Code style',
        description:
          'Lint rules that promote **good practices** and consistency in your code.',
        refs: [
          { type: 'group', plugin: 'eslint', slug: 'suggestions', weight: 1 },
        ],
      },
    ],
  };
}

export const coverageCoreConfig = async (
  projectName?: string
): Promise<CoreConfig> => {
  const name = projectName ?? process.env['NX_TASK_TARGET_PROJECT'];
  if (!name) {
    throw new Error('Project name is required');
  }
  const targetNames = ['unit-test', 'integration-test'];
  const targetArgs = [
    '-t',
    ...targetNames,
    '--coverage.enabled',
    '--skipNxCache',
  ];
  return {
    plugins: [
      await coveragePlugin({
        coverageToolCommand: {
          command: 'npx',
          args: [
            'nx',
            'run-many',
            `--projects ${name} ${targetArgs.join(' ')}`,
          ],
        },
        reports: targetNames.map(
          (targetName) =>
            `coverage/${name}/${targetName.replace('-test', '')}/lcov.info`
        ),
      }),
    ],
    categories: [
      {
        slug: 'code-coverage',
        title: 'Code coverage',
        description: 'Measures how much of your code is **covered by tests**.',
        refs: [
          {
            type: 'group',
            plugin: 'coverage',
            slug: 'coverage',
            weight: 1,
          },
        ],
      },
    ],
  };
};
