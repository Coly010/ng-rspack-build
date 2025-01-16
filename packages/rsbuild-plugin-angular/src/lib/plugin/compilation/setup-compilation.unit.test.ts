import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  MockInstance,
} from 'vitest';
import {
  DEFAULT_NG_COMPILER_OPTIONS,
  setupCompilation,
  styleTransform,
} from './setup-compilation.ts';
import { PluginAngularOptions } from '../../models/plugin-options.ts';
import { RsbuildConfig, RsbuildMode } from '@rsbuild/core';
import * as ts from 'typescript';
import * as ngCli from '@angular/compiler-cli';
import * as augmentModule from './augments.ts';
import * as sassEmbedModule from 'sass-embedded';

vi.mock('@angular/compiler-cli');

vi.mock('typescript');

vi.mock('sass-embedded');

describe('setupCompilation', () => {
  const rsBuildConfig: RsbuildConfig = {
    mode: 'none',
    source: {
      tsconfigPath: 'tsconfig.rsbuild.json',
    },
  };

  const pluginAngularOptions: Pick<
    PluginAngularOptions,
    'tsconfigPath' | 'jit' | 'inlineStylesExtension'
  > = {
    tsconfigPath: 'tsconfig.angular.json',
    jit: false,
    inlineStylesExtension: 'css',
  };

  const mockHost = { mocked: 'host' } as unknown as ts.CompilerHost;

  let readConfigurationSpy: MockInstance<
    [string],
    ngCli.AngularCompilerOptions
  >;

  let createIncrementalCompilerHostSpy: MockInstance<
    [options: ts.CompilerOptions, system?: ts.System],
    ts.CompilerHost
  >;
  let augmentHostWithResourcesSpy: MockInstance<
    [
      ts.CompilerHost,
      transform: (
        code: string,
        id: string,
        options?: { ssr?: boolean }
      ) => unknown,
      options?: {
        inlineStylesExtension?: PluginAngularOptions['inlineStylesExtension'];
        isProd?: boolean;
      }
    ],
    void
  >;

  beforeAll(() => {
    readConfigurationSpy = vi
      .spyOn(ngCli, 'readConfiguration')
      .mockReturnValue({
        options: pluginAngularOptions,
        rootNames: ['main.ts'],
      });

    createIncrementalCompilerHostSpy = vi
      .spyOn(ts, 'createIncrementalCompilerHost')
      .mockReturnValue(mockHost);

    augmentHostWithResourcesSpy = vi
      .spyOn(augmentModule, 'augmentHostWithResources')
      .mockImplementation(vi.fn());
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should return correct compilation configuration', () => {
    expect(setupCompilation(rsBuildConfig, pluginAngularOptions)).toStrictEqual(
      {
        compilerOptions: {
          inlineStylesExtension: 'css',
          jit: false,
          tsconfigPath: expect.stringMatching(/tsconfig.angular.json$/),
        },
        host: expect.any(Object),
        rootNames: ['main.ts'],
      }
    );
  });

  it('should read configuration from rs build configuration if given', () => {
    expect(() =>
      setupCompilation(rsBuildConfig, pluginAngularOptions)
    ).not.toThrow();

    expect(readConfigurationSpy).toHaveBeenCalledTimes(1);
    expect(readConfigurationSpy).toHaveBeenCalledWith(
      expect.stringMatching(/tsconfig.rsbuild.json$/),
      DEFAULT_NG_COMPILER_OPTIONS
    );
  });

  it('should read configuration from plugin angular options if rs build configuration is not given', () => {
    expect(() =>
      setupCompilation(
        {
          ...rsBuildConfig,
          source: undefined,
        },
        pluginAngularOptions
      )
    ).not.toThrow();

    expect(readConfigurationSpy).toHaveBeenCalledTimes(1);
    expect(readConfigurationSpy).toHaveBeenCalledWith(
      expect.stringMatching(/tsconfig.angular.json$/),
      DEFAULT_NG_COMPILER_OPTIONS
    );
  });

  it('should use the parsed compiler options to create an incremental compiler host', () => {
    expect(() =>
      setupCompilation(rsBuildConfig, pluginAngularOptions)
    ).not.toThrow();
    expect(createIncrementalCompilerHostSpy).toHaveBeenCalledTimes(1);
    expect(createIncrementalCompilerHostSpy).toHaveBeenCalledWith({
      inlineStylesExtension: 'css',
      jit: false,
      tsconfigPath: expect.stringMatching(/tsconfig.angular.json$/),
    });
  });

  it.each([
    'development',
    'production',
    'none',
  ] as const satisfies RsbuildMode[])(
    'should set inlineSources and inlineSourceMap based for build mode %s',
    (mode) => {
      const isProd = mode === 'production';

      expect(() =>
        setupCompilation({ ...rsBuildConfig, mode }, pluginAngularOptions)
      ).not.toThrow();
      expect(readConfigurationSpy).toHaveBeenCalledTimes(1);
      expect(readConfigurationSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          inlineSourceMap: !isProd,
          inlineSources: !isProd,
        })
      );
    }
  );

  it('should augment the host with resources if jit is false and use inlineStylesExtension in augmentation', () => {
    expect(() =>
      setupCompilation(rsBuildConfig, {
        ...pluginAngularOptions,
        jit: false,
        inlineStylesExtension: 'scss',
      })
    ).not.toThrow();
    expect(augmentHostWithResourcesSpy).toHaveBeenCalledTimes(1);
    expect(augmentHostWithResourcesSpy).toHaveBeenCalledWith(
      mockHost,
      expect.any(Function),
      {
        inlineStylesExtension: 'scss',
        isProd: false,
      }
    );
  });

  it('should not augment the host with resources if jit is true', () => {
    expect(() =>
      setupCompilation(rsBuildConfig, { ...pluginAngularOptions, jit: true })
    ).not.toThrow();
    expect(augmentHostWithResourcesSpy).not.toHaveBeenCalled();
  });

  it('should return all root names if useAllRoots is set to true', () => {
    const useAllRoots = true;
    const rootNames = ['main.ts', 'server.ts', 'other-entry.ts'];

    readConfigurationSpy.mockReturnValue({
      options: pluginAngularOptions,
      rootNames,
    });

    expect(
      setupCompilation(
        rsBuildConfig,
        { ...pluginAngularOptions, jit: true },
        false,
        useAllRoots
      )
    ).toStrictEqual(expect.objectContaining({ rootNames }));
  });

  it('should only include "main.ts" in root names if useAllRoots is set to false and isServer is set to false', () => {
    const useAllRoots = false;
    const isServer = false;
    const rootNames = ['src/main.ts', 'src/server.ts'];

    readConfigurationSpy.mockReturnValue({
      options: pluginAngularOptions,
      rootNames,
    });

    const { rootNames: filteredRootNames } = setupCompilation(
      rsBuildConfig,
      pluginAngularOptions,
      isServer,
      useAllRoots
    );
    expect(filteredRootNames).toStrictEqual(['src/main.ts']);
  });

  it('should exclude "main.ts" from root names if useAllRoots is set to false and isServer is set to true', () => {
    const useAllRoots = false;
    const isServer = true;
    const rootNames = ['src/main.ts', 'src/server.ts', 'src/other-entry.ts'];

    readConfigurationSpy.mockReturnValue({
      options: pluginAngularOptions,
      rootNames,
    });

    const { rootNames: filteredRootNames } = setupCompilation(
      rsBuildConfig,
      pluginAngularOptions,
      isServer,
      useAllRoots
    );
    expect(filteredRootNames).toStrictEqual([
      'src/server.ts',
      'src/other-entry.ts',
    ]);
  });
});

describe('styleTransform', () => {
  const sassCompileStringSpy = vi.spyOn(sassEmbedModule, 'compileString');
  beforeAll(() => {
    sassCompileStringSpy.mockClear();
  });

  it('should call t and return the value of the css property', () => {
    const code = 'test code';
    sassCompileStringSpy.mockReturnValueOnce({
      // @TODO use realistic test data to help with discoverability of the usage
      css: 'non realistic value',
      loadedUrls: [],
    });
    expect(styleTransform(code)).toBe('non realistic value');
    expect(sassCompileStringSpy).toHaveBeenCalledTimes(1);
    expect(sassCompileStringSpy).toHaveBeenCalledWith(code);
  });
});
