const angular = require('./eslint/src/lib/config/typescript');
const baseConfig = require('./eslint.config');
module.exports = [...baseConfig, ...angular];
