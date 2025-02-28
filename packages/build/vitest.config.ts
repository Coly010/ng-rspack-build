import { defineConfig } from 'vitest/config';
import { EXCLUDED_FILES_TEST } from '../../testing/setup/src/index.ts';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/build/unit',
  root: __dirname,
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    include: ['src/**/*.unit.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: '../../coverage/build/unit',
      exclude: [...EXCLUDED_FILES_TEST],
    },
    reporters: ['default'],
    passWithNoTests: true,
  },
});
