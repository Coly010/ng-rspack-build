const angular = require('./eslint/src/lib/config/angular');
const typescript = require('./eslint/src/lib/config/typescript');
const javascript = require('./eslint/src/lib/config/javascript');
const baseConfig = require('./eslint.config');
module.exports = [...baseConfig, ...angular, ...typescript, ...javascript];
