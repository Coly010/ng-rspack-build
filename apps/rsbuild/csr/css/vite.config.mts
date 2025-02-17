/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/rsbuild-csr-css/unit',
  plugins: [nxViteTsPaths(), nxCopyAssetsPlugin(['*.md']), angular({}) as any],
  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
    setupFiles: 'test-setup.ts',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../../coverage/rsbuild-csr-css/unit',
      provider: 'v8',
    },
  },
});
