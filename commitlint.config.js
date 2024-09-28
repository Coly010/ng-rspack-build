module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': () => [
      2,
      'always',
      ['repo', 'testing', 'ci', 'build', 'nx', 'nx-e2e', 'release'],
    ],
  },
};
