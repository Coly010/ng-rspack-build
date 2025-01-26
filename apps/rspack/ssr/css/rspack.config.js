const { createConfig } = require('@ng-rspack/build');

module.exports = () => {
  if (global.NX_GRAPH_CREATION !== undefined) {
    return createConfig({
      browser: './src/main.ts',
      server: './src/main.server.ts',
      ssrEntry: './src/server.ts',
    });
  }
  return {};
};
