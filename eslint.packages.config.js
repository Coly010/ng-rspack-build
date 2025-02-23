const baseConfig = require('./eslint.config');
const typescript = require('./eslint/src/lib/config/typescript');

module.exports = [...baseConfig, ...typescript];
