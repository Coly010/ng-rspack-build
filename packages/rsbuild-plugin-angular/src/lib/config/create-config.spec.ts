import { createConfig } from './create-config';
import { vi } from 'vitest';

describe('createConfig', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a CSR config', () => {
    const config = createConfig({
      root: __dirname,
      inlineStylesExtension: 'scss',
      tsconfigPath: './tsconfig.app.json',
    });

    expect(config).toMatchInlineSnapshot(`
      {
        "environments": {
          "browser": {
            "html": {
              "template": "./src/index.html",
            },
            "output": {
              "distPath": {
                "root": "dist/browser",
              },
              "target": "web",
            },
            "source": {
              "assetsInclude": [
                "./public",
              ],
              "entry": {
                "index": "./src/main.ts",
              },
              "preEntry": [
                "zone.js",
                "./src/styles.css",
              ],
            },
          },
        },
        "mode": "production",
        "plugins": [
          {
            "name": "plugin-angular",
            "post": [
              "plugin-angular-jit",
            ],
            "setup": [Function],
          },
        ],
        "root": "/Users/columferry/dev/nrwl/issues/rspack-angular/ng-rspack/packages/rsbuild-plugin-angular/src/lib/config",
        "source": {
          "tsconfigPath": "./tsconfig.app.json",
        },
      }
    `);
  });

  it('should create a SSR config', () => {
    vi.mock('node:fs', async (importOriginal) => {
      return {
        ...(await importOriginal<typeof import('node:fs')>()),
        existsSync: () => true,
      };
    });
    const config = createConfig({
      root: __dirname,
      server: './src/main.server.ts',
      ssrEntry: './src/server.ts',
      inlineStylesExtension: 'scss',
      tsconfigPath: './tsconfig.app.json',
    });

    expect(config).toMatchInlineSnapshot(`
      {
        "environments": {
          "browser": {
            "html": {
              "template": "./src/index.html",
            },
            "output": {
              "distPath": {
                "root": "dist/browser",
              },
              "target": "web",
            },
            "source": {
              "assetsInclude": [
                "./public",
              ],
              "entry": {
                "index": "./src/main.ts",
              },
              "preEntry": [
                "zone.js",
                "./src/styles.css",
              ],
            },
          },
          "server": {
            "output": {
              "distPath": {
                "root": "dist/server",
              },
              "target": "node",
            },
            "source": {
              "entry": {
                "server": "./src/server.ts",
              },
              "preEntry": [
                "zone.js",
              ],
            },
          },
        },
        "mode": "production",
        "plugins": [
          {
            "name": "plugin-angular",
            "post": [
              "plugin-angular-jit",
            ],
            "setup": [Function],
          },
        ],
        "root": "/Users/columferry/dev/nrwl/issues/rspack-angular/ng-rspack/packages/rsbuild-plugin-angular/src/lib/config",
        "source": {
          "tsconfigPath": "./tsconfig.app.json",
        },
      }
    `);
  });
});
