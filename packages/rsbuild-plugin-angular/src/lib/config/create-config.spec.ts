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
        "dev": {},
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
            "plugins": [
              {
                "name": "plugin-angular",
                "post": [
                  "plugin-angular-jit",
                ],
                "setup": [Function],
              },
            ],
            "source": {
              "assetsInclude": [
                "./public",
              ],
              "define": {
                "ngJitMode": undefined,
              },
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
        "mode": "development",
        "root": "/Users/columferry/dev/nrwl/issues/rspack-angular/ng-rspack/packages/rsbuild-plugin-angular/src/lib/config",
        "server": {
          "historyApiFallback": {
            "index": "/index.html",
            "rewrites": [
              {
                "from": /\\^\\\\/\\$/,
                "to": "index.html",
              },
            ],
          },
          "host": "localhost",
          "htmlFallback": false,
          "port": 4200,
        },
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
        "dev": {},
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
            "plugins": [
              {
                "name": "plugin-angular",
                "post": [
                  "plugin-angular-jit",
                ],
                "setup": [Function],
              },
            ],
            "source": {
              "assetsInclude": [
                "./public",
              ],
              "define": {
                "ngJitMode": undefined,
              },
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
              "polyfill": "entry",
              "target": "node",
            },
            "plugins": [
              {
                "name": "plugin-angular",
                "post": [
                  "plugin-angular-jit",
                ],
                "setup": [Function],
              },
            ],
            "source": {
              "define": {
                "ngJitMode": undefined,
                "ngServerMode": true,
              },
              "entry": {
                "bootstrap": "./src/main.server.ts",
                "server": "./src/server.ts",
              },
              "preEntry": [
                "zone.js/node",
                "@angular/platform-server/init",
              ],
            },
          },
        },
        "mode": "development",
        "root": "/Users/columferry/dev/nrwl/issues/rspack-angular/ng-rspack/packages/rsbuild-plugin-angular/src/lib/config",
        "server": {
          "historyApiFallback": {
            "index": "/index.html",
            "rewrites": [
              {
                "from": /\\^\\\\/\\$/,
                "to": "index.html",
              },
            ],
          },
          "host": "localhost",
          "htmlFallback": false,
          "port": 4200,
        },
        "source": {
          "tsconfigPath": "./tsconfig.app.json",
        },
      }
    `);
  });
});
