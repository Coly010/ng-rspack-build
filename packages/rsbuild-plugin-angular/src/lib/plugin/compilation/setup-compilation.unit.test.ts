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
} from './setup-compilation.ts';
import { PluginAngularOptions } from '../../models/plugin-options.ts';
import { RsbuildConfig } from '@rsbuild/core';
import * as ts from 'typescript';
import * as ngCli from '@angular/compiler-cli';
import * as augmentModule from './augments.ts';

vi.mock('@angular/compiler-cli');

vi.mock('typescript');

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

  it('should augment the host with resources if not in JIT mode', () => {
    expect(() =>
      setupCompilation(rsBuildConfig, pluginAngularOptions)
    ).not.toThrow();
    expect(augmentHostWithResourcesSpy).toHaveBeenCalledTimes(1);
  });

  it('should augment the host with resources if in JIT mode', () => {
    expect(() =>
      setupCompilation(rsBuildConfig, {
        ...pluginAngularOptions,
        jit: true,
      })
    ).not.toThrow();
    expect(augmentHostWithResourcesSpy).not.toHaveBeenCalled();
  });

  it('should not filter rootNames if useAllRoots is true', () => {
    const rootNames = [
      'src/main.ts',
      'other/main.ts',
      'src/server.ts',
      'other/server.ts',
    ];
    readConfigurationSpy.mockReturnValue({
      options: {},
      rootNames,
    });
    const useAllRoots = true;

    expect(
      setupCompilation(rsBuildConfig, pluginAngularOptions, false, useAllRoots)
    ).toStrictEqual(expect.objectContaining({ rootNames }));
  });

  it('should filter rootNames for files ending with "main.ts" if useAllRoots is false and isServer is false', () => {
    const rootNames = [
      'src/main.ts',
      'other/main.ts',
      'src/server.ts',
      'other/server.ts',
    ];
    readConfigurationSpy.mockReturnValue({
      options: {},
      rootNames,
    });
    const useAllRoots = false;
    const isServer = false;

    expect(
      setupCompilation(
        rsBuildConfig,
        pluginAngularOptions,
        isServer,
        useAllRoots
      )
    ).toStrictEqual(
      expect.objectContaining({
        rootNames: ['src/main.ts', 'other/main.ts'],
      })
    );
  });

  it('should filter rootNames for files not ending with "main.ts" if useAllRoots is false and isServer is true', () => {
    const rootNames = [
      'src/main.ts',
      'other/main.ts',
      'src/server.ts',
      'other/server.ts',
    ];
    readConfigurationSpy.mockReturnValue({
      options: {},
      rootNames,
    });
    const useAllRoots = false;
    const isServer = true;

    expect(
      setupCompilation(
        rsBuildConfig,
        pluginAngularOptions,
        isServer,
        useAllRoots
      )
    ).toStrictEqual(
      expect.objectContaining({
        rootNames: ['src/server.ts', 'other/server.ts'],
      })
    );
  });
});
