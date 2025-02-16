import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
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
    include: ['src/**/*.unit.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    passWithNoTests: true,
    reporters: ['default'],
  },
});
