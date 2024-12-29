import { defineConfig } from '@rsbuild/core';
import { pluginAngular } from '@ng-rspack/build/rsbuild';

export default defineConfig({
  root: __dirname,
  source: {
    tsconfigPath: './tsconfig.app.json',
  },
  plugins: [
    pluginAngular({
      root: __dirname,
      inlineStylesExtension: 'css',
      tsconfigPath: './tsconfig.app.json',
    }),
  ],
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  environments: {
    browser: {
      source: {
        preEntry: ['zone.js', './src/styles.css'],
        entry: { index: './src/main.ts' },
        assetsInclude: ['./public'],
      },
      output: {
        target: 'web',
        distPath: {
          root: 'dist/browser',
        },
      },
      html: {
        template: './src/index.html',
      },
    },
    server: {
      source: {
        preEntry: ['zone.js'],
        entry: {
          server: './src/server.ts',
        },
      },
      output: {
        target: 'node',
        distPath: {
          root: 'dist/server',
        },
      },
    },
  },
});
