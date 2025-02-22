
export default () => {
  if (global.NX_GRAPH_CREATION === undefined) {
    const { createConfig } = require('@ng-rsbuild/plugin-angular');
    return createConfig({
      browser: './src/main.ts',
      server: './src/main.server.ts',
      ssrEntry: './src/server.ts',
      inlineStylesExtension: 'css',
    });
  }
  return {};
};
