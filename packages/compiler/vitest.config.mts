import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
// eslint-disable-next-line @nx/dependency-chekc
import { EXCLUDED_FILES_TEST } from '../../testing/setup/src/index.ts';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/compiler/unit',
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
    setupFiles: ['../../testing/vitest-setup/src/lib/fs-memfs.setup-file.ts'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: '../../coverage/compiler/unit',
      exclude: [...EXCLUDED_FILES_TEST],
    },
  },
});
