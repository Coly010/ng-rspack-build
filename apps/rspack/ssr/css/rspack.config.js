const { createConfig } = require('@ng-rspack/build');

module.exports = createConfig({
  browser: './src/main.ts',
  server: './src/main.server.ts',
  ssrEntry: './src/server.ts',
});
