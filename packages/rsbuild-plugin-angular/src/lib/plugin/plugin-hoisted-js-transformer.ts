import type { RsbuildPlugin } from '@rsbuild/core';
import {
  buildAndAnalyzeWithParallelCompilation,
  setupCompilationWithParallelCompilation,
  JavaScriptTransformer,
  JS_ALL_EXT_REGEX,
} from '@ng-rspack/compiler';
import { PluginAngularOptions } from '../models/plugin-options';
import { normalizeOptions } from '../models/normalize-options';
import { maxWorkers } from '../utils/utils';

export const pluginHoistedJsTransformer = (
  options: PluginAngularOptions
): RsbuildPlugin => ({
  name: 'plugin-hoisted-js-transformer',
  post: ['plugin-angular'],
  setup(api) {
    const pluginOptions = normalizeOptions(options);
    const config = api.getRsbuildConfig();
    const typescriptFileCache = new Map<string, string | Uint8Array>();
    let watchMode = false;
    let isServer = pluginOptions.hasServer;
    const javascriptTransformer = new JavaScriptTransformer(
      {
        sourcemap: false,
        thirdPartySourcemaps: false,
        advancedOptimizations: false,
        jit: pluginOptions.jit,
      },
      maxWorkers
    );
    api.onBeforeStartDevServer(() => {
      watchMode = true;
    });

    api.modifyRspackConfig((config, { environment }) => {
      isServer = isServer && environment.name === 'server';
      return config;
    });

    api.onBeforeEnvironmentCompile(async () => {
      const parallelCompilation = await setupCompilationWithParallelCompilation(
        config,
        pluginOptions
      );
      await buildAndAnalyzeWithParallelCompilation(
        parallelCompilation,
        typescriptFileCache,
        javascriptTransformer
      );
      await parallelCompilation.close();
    });

    api.transform({ test: JS_ALL_EXT_REGEX }, ({ code, resource }) => {
      if (!code.includes('@angular')) {
        return code;
      }
      const existingTransform = typescriptFileCache.get(resource);
      if (existingTransform) {
        if (typeof existingTransform === 'string') {
          return existingTransform;
        } else {
          return Buffer.from(existingTransform).toString();
        }
      }
      return javascriptTransformer
        .transformData(resource, code, false, false)
        .then((contents: Uint8Array) => {
          const transformedCode = Buffer.from(contents).toString('utf8');
          typescriptFileCache.set(resource, transformedCode);
          return transformedCode;
        });
    });

    api.expose('plugin-hoisted-js-transformer', {
      typescriptFileCache,
    });
  },
});
