export default () => {
  // @ts-ignore
  if (global.NX_GRAPH_CREATION === undefined) {
    const { createConfig } = require('@ng-rsbuild/plugin-angular');
    return createConfig({
      browser: './src/main.ts',
      inlineStylesExtension: 'css',
      styles: ['./src/styles.css'],
    });
  }
  return {};
};
