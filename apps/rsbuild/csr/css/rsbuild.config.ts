import { defineConfig } from '@rsbuild/core';
import { pluginAngular } from '@ng-rspack/build/rsbuild';

export default defineConfig({
  root: __dirname,
  plugins: [
    pluginAngular({
      root: __dirname,
      inlineStylesExtension: 'css',
      tsconfigPath: './tsconfig.app.json',
    }),
  ],
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  source: {
    preEntry: ['zone.js', './src/styles.css'],
    entry: { index: './src/main.ts' },
    assetsInclude: ['./public'],
    tsconfigPath: './tsconfig.app.json',
  },
  html: {
    template: './src/index.html',
  },
  server: {
    port: 4200,
    host: 'localhost',
  },
});
