import { defineConfig } from '@rsbuild/core';
import { rsbuild } from '@ng-rspack/build';
import { pluginSass } from '@rsbuild/plugin-sass';

export default defineConfig({
  root: __dirname,
  plugins: [
    rsbuild.pluginAngular({
      root: __dirname,
      tsconfigPath: './tsconfig.app.json',
      inlineStylesExtension: 'scss',
    }),
    pluginSass(),
  ],
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  source: {
    preEntry: ['zone.js', './src/styles.scss'],
    entry: {
      index: './src/main.ts',
    },
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
