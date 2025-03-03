const baseConfig = require('./eslint.config');
const typescript = require('./eslint/src/lib/config/typescript');
const javascript = require('./eslint/src/lib/config/javascript.js');

module.exports = [...baseConfig, ...typescript, ...javascript];
