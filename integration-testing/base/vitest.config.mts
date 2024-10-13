/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  plugins: [nxViteTsPaths()],
  test: {
    globalSetup: '../../tools/scripts/start-local-registry.ts',
    watch: false,
    testTimeout: 50_000,
  },
});
