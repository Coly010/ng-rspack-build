import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  root: './',
  source: {
    tsconfigPath: './mocks/fixtures/integration/minimal/tsconfig.mock.json',
  },
  server: {
    host: 'localhost',
    port: 4200,
    htmlFallback: false,
    historyApiFallback: {
      index: '/index.html',
      rewrites: [{ from: /^\/$/, to: 'index.html' }],
    },
  },
  tools: {
    rspack(config) {
      config.resolve ??= {};
      config.resolve.extensionAlias = {};
    },
  },
  environments: {
    browser: {
      source: {
        entry: {
          index: './src/main.ts',
        },
      },
      output: {
        target: 'web',
        distPath: {
          root: 'dist/browser',
        },
      },
      html: {
        template: 'index.html',
      },
    },
  },
});
