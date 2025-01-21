export default () => {
  if (global.NX_GRAPH_CREATION === undefined) {
    const { createConfig } = require('@ng-rsbuild/plugin-angular');
    return createConfig({
      browser: './src/main.ts',
      inlineStylesExtension: 'css',
    });
  }
  return {};
};
