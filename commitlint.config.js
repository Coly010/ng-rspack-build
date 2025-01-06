module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': () => [
      2,
      'always',
      [
        'repo',
        'testing',
        'ci',
        'build',
        'nx',
        'rsbuild-plugin-angular',
        'rsbuild-plugin-nx',
        'nx-e2e',
        'release',
        'docs',
      ],
    ],
  },
};
