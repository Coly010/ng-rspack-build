import { defineConfig } from '@rsbuild/core';
import { rsbuildAngular } from './plugin/rsbuild-angular';
import { pluginSass } from '@rsbuild/plugin-sass';

export default defineConfig({
  root: __dirname,
  plugins: [rsbuildAngular(), pluginSass()],
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
