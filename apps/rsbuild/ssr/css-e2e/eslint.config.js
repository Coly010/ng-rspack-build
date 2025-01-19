const nextEslintConfig = require('../../../../eslint.config');

module.exports = [
  ...nextEslintConfig,
  {
        files: ["**/*"],
        rules: {

        }
      }
];
