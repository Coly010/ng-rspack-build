import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  cacheDir:
    '../../node_modules/.vite/packages/rsbuild-plugin-angular/integration-test',
  plugins: [],
  resolve: {
    alias: {
      '@ng-rspack/testing-utils': resolve(__dirname, '../../testing/utils/src'),
    },
  },
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    include: ['src/**/*.integration.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    passWithNoTests: true,
    reporters: ['default'],
    coverage: {
      reportsDirectory:
        '../../coverage/packages/rsbuild-plugin-angular/integration-test',
      provider: 'v8',
    },
  },
});
