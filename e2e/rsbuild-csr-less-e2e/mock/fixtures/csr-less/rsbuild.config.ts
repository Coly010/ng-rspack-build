export default () => {
  // @ts-ignore
  if (global.NX_GRAPH_CREATION === undefined) {
    const { createConfig } = require('@ng-rsbuild/plugin-angular');
    return createConfig({
      browser: './src/main.ts',
      inlineStylesExtension: 'less',
      styles: ['./src/styles.less'],
    });
  }
  return {};
};
