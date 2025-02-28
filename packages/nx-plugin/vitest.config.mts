import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { EXCLUDED_FILES_TEST } from '../../testing/setup/src/index.ts';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/nx-plugin/unit',
  root: __dirname,
  plugins: [],
  resolve: {
    alias: {
      '@ng-rspack/testing-utils': resolve(__dirname, '../../testing/utils/src'),
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: '../../coverage/nx-plugin/unit',
      exclude: [...EXCLUDED_FILES_TEST],
    },
    watch: false,
    globals: true,
    environment: 'node',
    include: ['src/**/*.unit.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    passWithNoTests: true,
    reporters: ['default'],
  },
});
