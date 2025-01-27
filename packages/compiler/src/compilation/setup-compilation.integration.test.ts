import { describe, expect } from 'vitest';
import { styleTransform } from './setup-compilation.ts';
import { setupCompilation } from './setup-compilation.ts';
import * as compilerCli from '@angular/compiler-cli';
import path from 'node:path';
// @TODO At the moment this tests rely on another function (createConfig)
// The tests should be free of any dependencies.
import rsBuildMockConfig from '../../mocks/fixtures/integration/minimal/rsbuild.mock.config.ts';

describe('styleTransform', () => {
  it('should call scss.compileString and return the value of the css property', async () => {
    const code = `
      h1 {
        font-size: 40px;
        code {
          font-face: Roboto Mono;
        }
      }
    `;

    expect(styleTransform(code)).toMatchInlineSnapshot(`
      "h1 {
        font-size: 40px;
      }
      h1 code {
        font-face: Roboto Mono;
      }"
    `);
  });
});

describe('setupCompilation', () => {
  const fixturesDir = path.join(
    process.cwd(),
    'mocks',
    'fixtures',
    'integration',
    'minimal'
  );

  // @TODO remove when test data are independent onbjects
  it.skip('should read from correct tsconfigPath in rsBuildMockConfig', () => {
    expect(rsBuildMockConfig.source?.tsconfigPath).toBe(
      './mocks/fixtures/integration/minimal/tsconfig.mock.json'
    );
    expect(
      compilerCli.readConfiguration(rsBuildMockConfig.source?.tsconfigPath, {})
    ).toStrictEqual(
      expect.objectContaining({
        rootNames: [expect.stringMatching(/mock.main.ts$/)],
      })
    );
  });

  // @TODO remove when test data are independent onbjects
  it.skip('should read from correct tsconfigPath in other tsconfig', () => {
    expect(
      compilerCli.readConfiguration(
        path.join(fixturesDir, 'tsconfig.other.mock.json'),
        {}
      )
    ).toStrictEqual(
      expect.objectContaining({
        rootNames: [expect.stringMatching(/mock.main.ts$/)],
      })
    );
  });

  it('should create compiler options form rsBuildConfig tsconfigPath', () => {
    expect(
      setupCompilation(rsBuildMockConfig, {
        tsconfigPath: 'irrelevant-if-tsconfig-is-in-rsbuild-config',
        jit: false,
        inlineStylesExtension: 'css',
      })
    ).toStrictEqual(
      expect.objectContaining({
        compilerOptions: expect.objectContaining({
          configFilePath: expect.stringMatching(/tsconfig.mock.json$/),
        }),
        rootNames: [expect.stringMatching(/mock.main.ts$/)],
      })
    );
  });

  it('should create compiler options form ts compiler options if rsBuildConfig tsconfigPath is undefined', () => {
    expect(
      setupCompilation(
        {
          ...rsBuildMockConfig,
          source: {
            ...rsBuildMockConfig.source,
            tsconfigPath: undefined,
          },
        },
        {
          tsconfigPath: path.join(fixturesDir, 'tsconfig.other.mock.json'),
          jit: false,
          inlineStylesExtension: 'css',
        }
      )
    ).toStrictEqual(
      expect.objectContaining({
        compilerOptions: expect.objectContaining({}),
        rootNames: [expect.stringMatching(/other\/mock.main.ts$/)],
      })
    );
  });
});
