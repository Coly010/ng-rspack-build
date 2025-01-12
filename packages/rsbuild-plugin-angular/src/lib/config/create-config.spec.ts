import { createConfig } from './create-config';
import { vi } from 'vitest';

describe('createConfig', () => {
  const normalizedRoot = __dirname;
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
              "copy": [
                {
                  "from": "./public",
                  "to": ".",
                },
              ],
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
                "pre": [
                  "plugin-hoisted-js-transformer",
                ],
                "setup": [Function],
              },
            ],
            "source": {
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
        "plugins": [
          {
            "name": "plugin-hoisted-js-transformer",
            "post": [
              "plugin-angular",
            ],
            "setup": [Function],
          },
        ],
        "root": "${normalizedRoot}",
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
        "tools": {
          "rspack": [Function],
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
              "copy": [
                {
                  "from": "./public",
                  "to": ".",
                },
              ],
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
                "pre": [
                  "plugin-hoisted-js-transformer",
                ],
                "setup": [Function],
              },
            ],
            "source": {
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
                "pre": [
                  "plugin-hoisted-js-transformer",
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
        "plugins": [
          {
            "name": "plugin-hoisted-js-transformer",
            "post": [
              "plugin-angular",
            ],
            "setup": [Function],
          },
        ],
        "root": "${normalizedRoot}",
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
        "tools": {
          "rspack": [Function],
        },
      }
    `);
  });
});
