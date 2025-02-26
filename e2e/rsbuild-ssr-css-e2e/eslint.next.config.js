const baseConfig = require('../../eslint.config');
const playwright = require('../../eslint/src/lib/config/playwright.js');

module.exports = [
  ...baseConfig,
  ...playwright,
  {
    files: ['**/*'],
    rules: {},
  },
];
