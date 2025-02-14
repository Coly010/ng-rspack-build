import { describe, expect } from 'vitest';
import { setupCompilation, styleTransform } from './setup-compilation.ts';
import path from 'node:path';
import rsBuildMockConfig from '../../mocks/fixtures/integration/minimal/rsbuild.mock.config.ts';

vi.mock('../utils', () => ({
  loadCompilerCli: vi.fn().mockImplementation(() => ({
    readConfiguration: vi.fn().mockReturnValue({
      options: {},
      rootNames: ['main.ts'],
    }),
  })),
}));

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

describe.skip('setupCompilation', () => {
  const fixturesDir = path.join(
    process.cwd(),
    'mocks',
    'fixtures',
    'integration',
    'minimal'
  );

  it('should create compiler options form rsBuildConfig tsconfigPath', () => {
    expect(
      setupCompilation(rsBuildMockConfig, {
        tsconfigPath: 'irrelevant-if-tsconfig-is-in-rsbuild-config',
        jit: false,
        inlineStylesExtension: 'css',
        fileReplacements: [],
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
          fileReplacements: [],
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
