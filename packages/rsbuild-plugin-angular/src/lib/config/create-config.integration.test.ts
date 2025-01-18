import { createConfig } from './create-config';
import { osAgnosticPath } from '@ng-rspack/testing-utils';
import { beforeAll, beforeEach, expect } from 'vitest';
import * as normalizeModule from '../models/normalize-options.ts';
import { DEFAULT_PLUGIN_ANGULAR_OPTIONS } from '../models/normalize-options.ts';

vi.mock('../models/normalize-options.ts', async (importOriginal) => {
  return {
    ...(await importOriginal()),
    getHasServer: vi.fn(),
  };
});

describe('createConfig', () => {
  const root = process.cwd();
  const argvSpy = vi.spyOn(process, 'argv', 'get');
  const normalizeOptionsSpy = vi.spyOn(normalizeModule, 'normalizeOptions');

  beforeAll(() => {
    argvSpy.mockReturnValue([]);
    normalizeOptionsSpy.mockReturnValue(DEFAULT_PLUGIN_ANGULAR_OPTIONS);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NODE_ENV', '');
  });

  it.each(['development', 'not-production'])(
    'should create config for mode "development" if env variable NODE_ENV is "%s"',
    (nodeEnv) => {
      vi.stubEnv('NODE_ENV', nodeEnv);

      expect(
        createConfig({
          root,
          inlineStylesExtension: 'scss',
          tsconfigPath: './tsconfig.app.json',
        }).mode
      ).toBe('development');
    }
  );

  it('should create config for mode "production" if env variable NODE_ENV is "production"', () => {
    vi.stubEnv('NODE_ENV', 'production');

    expect(
      createConfig({
        root,
        inlineStylesExtension: 'scss',
        tsconfigPath: './tsconfig.app.json',
      }).mode
    ).toBe('production');
  });

  it('should have dev property defined if the process started with "dev" argument and a server is configured', () => {

    argvSpy.mockReturnValue(['irrelevant', 'irrelevant', 'dev']);
    normalizeOptionsSpy.mockReturnValue({
      ...DEFAULT_PLUGIN_ANGULAR_OPTIONS,
      hasServer: true,
    });

    expect(
      createConfig({
        root,
        inlineStylesExtension: 'scss',
        tsconfigPath: './tsconfig.app.json',
      })
    ).toStrictEqual(
      expect.objectContaining({
        dev: {
          client: {
            host: 'localhost',
            port: 4200,
          },
          hmr: false,
          liveReload: true,
          writeToDisk: expect.any(Function),
        },
      })
    );
  });

  it('should create config without dev property configured if not running dev server', () => {
    argvSpy.mockReturnValue([]);

    expect(
      createConfig({
        server: './src/main.server.ts',
        root,
        hasServer: true,
        inlineStylesExtension: 'scss',
        tsconfigPath: './tsconfig.app.json',
      })
    ).toStrictEqual(
      expect.objectContaining({
        dev: {},
      })
    );
  });

  it('should create a CSR config', () => {
    const config = createConfig({
      root,
      inlineStylesExtension: 'scss',
      tsconfigPath: './tsconfig.app.json',
    });
    expect(
      `import type { RsbuildConfig } from '@rsbuild/core';\nconst config: RsbuildConfig = ${JSON.stringify(
        {
          ...config,
          root: config.root ? osAgnosticPath(config.root) : undefined,
          source: {
            tsconfigPath: config.source?.tsconfigPath ? osAgnosticPath(config.source?.tsconfigPath) : undefined,
          }
        },
        null,
        2
      )}`
    ).toMatchFileSnapshot('__snapshots__/create-config.csr.ts');
  });

  it('should create a SSR config', () => {
    const config = createConfig({
      root,
      server: './src/main.server.ts',
      ssrEntry: './src/server.ts',
      inlineStylesExtension: 'scss',
      tsconfigPath: './tsconfig.app.json',
    });

    expect(
      `import type { RsbuildConfig } from '@rsbuild/core';\nconst config: RsbuildConfig = ${JSON.stringify(
        {
          ...config,
          root: config.root ? osAgnosticPath(config.root) : undefined,
          source: {
            tsconfigPath: config.source?.tsconfigPath ? osAgnosticPath(config.source?.tsconfigPath) : undefined,
          }
        },
        null,
        2
      )}`
    ).toMatchFileSnapshot('__snapshots__/create-config.ssr.ts');
  });
});
