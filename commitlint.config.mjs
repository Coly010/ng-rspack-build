import config from '@commitlint/config-conventional';
import nxScopes from '@commitlint/config-nx-scopes';
import { RuleConfigSeverity } from '@commitlint/types';

/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  plugins: ['commitlint-plugin-tense'],
  rules: {
    'scope-enum': async (ctx) => {
      const projects = nxScopes.utils.getProjects(
        ctx,
        ({ projectType }) =>
          projectType === 'library' || projectType === 'application'
      );
      const scopes = [
        ...projects,
        'tools',
        'workflows',
        'testing',
        'repo',
        'build',
      ].sort();
      return [RuleConfigSeverity.Error, 'always', scopes];
    },
    'type-enum': () => {
      const defaultTypes = config.rules['type-enum'][2];
      const types = [
        ...defaultTypes,
        'ci', // custom type for CI related commits and workflows
        'repo', // custom type for commits targeting the whole repository
        'release', // custom type for release commits
      ];
      return [RuleConfigSeverity.Error, 'always', types];
    },
    'tense/subject-tense': [
      RuleConfigSeverity.Error,
      'always',
      { firstOnly: true, allowedTenses: ['present-imperative'] },
    ],
  },
};
