import { createConfig } from './create-config';
import { beforeAll, beforeEach, expect } from 'vitest';
import * as normalizeModule from '../models/normalize-options.ts';
import { DEFAULT_PLUGIN_ANGULAR_OPTIONS } from '../models/normalize-options.ts';
import * as rsbuildCoreModule from '@rsbuild/core';
import { PluginAngularOptions } from '../models/plugin-options.ts';

vi.mock('@rsbuild/core');

describe('createConfig', () => {
  const argvSpy = vi.spyOn(process, 'argv', 'get');
  const normalizeOptionsSpy = vi.spyOn(normalizeModule, 'normalizeOptions');
  const defineConfigSpy = vi.spyOn(rsbuildCoreModule, 'defineConfig');

  beforeAll(() => {
    argvSpy.mockReturnValue([]);
    normalizeOptionsSpy.mockReturnValue(DEFAULT_PLUGIN_ANGULAR_OPTIONS);
    defineConfigSpy.mockReturnValue({});
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NODE_ENV', '');
  });

  it.each(['development', 'not-production'])(
    'should create config for mode "development" if env variable NODE_ENV is "%s"',
    (nodeEnv) => {
      vi.stubEnv('NODE_ENV', nodeEnv);

      expect(() => createConfig({})).not.toThrow();

      expect(defineConfigSpy).toHaveBeenCalledWith(
        expect.objectContaining({ mode: 'development' })
      );
    }
  );

  it('should create config for mode "production" if env variable NODE_ENV is "production"', () => {
    vi.stubEnv('NODE_ENV', 'production');

    expect(() => createConfig({})).not.toThrow();

    expect(defineConfigSpy).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'production' })
    );
  });

  it('should have dev property defined if the process started with "dev" argument and a server is configured', () => {
    argvSpy.mockReturnValue(['irrelevant', 'irrelevant', 'dev']);
    normalizeOptionsSpy.mockReturnValue({
      ...DEFAULT_PLUGIN_ANGULAR_OPTIONS,
      hasServer: true,
    });

    expect(() => createConfig({})).not.toThrow();

    expect(defineConfigSpy).toHaveBeenCalledWith(
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

    expect(() => createConfig({})).not.toThrow();

    expect(defineConfigSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        dev: {},
      })
    );
  });

  it('should used definedConfig for both passed objects', () => {
    defineConfigSpy.mockImplementation((config) => config);
    normalizeOptionsSpy.mockImplementation(
      (options) => options as PluginAngularOptions
    );

    expect(() =>
      createConfig(
        {
          root: 'plugin-options',
          polyfills: [],
          styles: [],
          assets: [],
        },
        {
          source: {
            tsconfigPath: 'tsconfig.random.json',
          },
        }
      )
    ).not.toThrow();
    expect(defineConfigSpy).toHaveBeenCalledTimes(2);
    expect(defineConfigSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ root: 'plugin-options' })
    );
    expect(defineConfigSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        source: {
          tsconfigPath: 'tsconfig.random.json',
        },
      })
    );
  });
});
