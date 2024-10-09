import { ExecutorContext } from '@nx/devkit';
import { createRspackConfig } from './create-rspack-config';
import { BuildExecutorSchema } from '../executors/build/schema';
import { Compiler, RspackOptionsNormalized, RuleSetRule } from '@rspack/core';
import { NgRspackPlugin } from 'packages/build/src/lib/plugins/ng-rspack';

describe('Create rspack config', () => {
  let executorContext: ExecutorContext = null;
  beforeEach(() => {
    executorContext = {
      root: '/<workspace-root>',
      cwd: '/<workspace-root>',
      isVerbose: false,
      projectName: 'the-project',
      projectGraph: {
        nodes: {
          'the-project': {
            type: 'app',
            name: 'the-project',
            data: {
              root: 'apps/the-project',
              name: 'the-project',
            },
          },
        },
        dependencies: {},
      },
    };
  });

  it('resolve paths relative to workspace root', async () => {
    const options: BuildExecutorSchema = {
      outputPath: 'apps/the-project/dist',
      main: 'apps/the-project/src/main.ts',
      index: 'apps/the-project/src/index.html',
      tsConfig: 'apps/the-project/ts.config.json',
      stylePreprocessorOptions: {
        includePaths: ['apps/the-project/src/styles', 'packages/common/styles'],
      },
      polyfills: ['zone.js'],
      scripts: ['apps/the-project/src/scripts/base.js'],
      styles: ['apps/the-project/src/styles/base.scss'],
      assets: ['apps/the-project/src/assets/base.png'],
    };

    process.env['NODE_ENV'] = 'development';
    process.env['WEBPACK_SERVE'] = 'true';

    const rspackConfig = createRspackConfig(options, executorContext);

    expect(rspackConfig.context).toBe('/<workspace-root>/apps/the-project');
    expect(rspackConfig.entry['main'].import).toEqual(['src/main.ts']);
    expect(rspackConfig.output.uniqueName).toBe('the-project');
    expect(rspackConfig.output.path).toBe(
      '/<workspace-root>/apps/the-project/dist'
    );
    expect(
      (rspackConfig.resolve.tsConfig as { configFile: string }).configFile
    ).toBe('/<workspace-root>/apps/the-project/ts.config.json');

    const hmrLoaderRule = rspackConfig.module.rules.find((rule: RuleSetRule) =>
      rule.loader.endsWith('/build/src/lib/loaders/hmr/hmr-loader.ts')
    ) as RuleSetRule;
    expect(hmrLoaderRule.include).toEqual([
      '/<workspace-root>/apps/the-project/src/main.ts',
    ]);

    const sassLoaderRule = rspackConfig.module.rules.find((rule: RuleSetRule) =>
      (rule.test as RegExp)?.test('.scss')
    ) as RuleSetRule;
    expect(sassLoaderRule.use[0].options.sassOptions.loadPaths).toEqual([
      '/<workspace-root>/apps/the-project/src/styles',
      '/<workspace-root>/packages/common/styles',
    ]);

    const compiler = new Compiler('context', {
      output: {},
      resolve: rspackConfig.resolve,
    } as RspackOptionsNormalized);
    (rspackConfig.plugins[0] as NgRspackPlugin).apply(compiler);

    // TODO remove the following tricky way to check the correctness of plugin options
    expect(
      compiler.__internal__builtinPlugins
        .filter((plugin) => plugin.name === 'EntryPlugin')
        .map(({ options: { entry } }: any) => entry)
    ).toEqual(['zone.js', 'src/styles/base.scss', 'src/scripts/base.js']);
    expect(
      compiler.__internal__builtinPlugins
        .filter((plugin) => plugin.name === 'CopyRspackPlugin')
        .map(({ options: { patterns } }: any) =>
          patterns.map((pattern) => pattern.from)
        )
    ).toEqual([['/<workspace-root>/apps/the-project/src/assets/base.png']]);
    expect(
      compiler.__internal__builtinPlugins
        .filter((plugin) => plugin.name === 'HtmlRspackPlugin')
        .map(({ options }: any) => options.template)
    ).toEqual(['/<workspace-root>/apps/the-project/src/index.html']);
  });
});
