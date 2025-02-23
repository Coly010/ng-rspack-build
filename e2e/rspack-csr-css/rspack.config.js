module.exports = () => {
  if (global.NX_GRAPH_CREATION === undefined) {
    const { createConfig } = require('@ng-rspack/build');
    return createConfig({
      root: __dirname,
      name: 'rspack-csr-css',
      index: './src/index.html',
      assets: ['./public'],
      styles: ['./src/styles.css'],
      polyfills: ['zone.js'],
      main: './src/main.ts',
      outputPath: './dist/browser',
      tsConfig: './tsconfig.app.json',
      skipTypeChecking: false,
    });
  }
  return {};
};
