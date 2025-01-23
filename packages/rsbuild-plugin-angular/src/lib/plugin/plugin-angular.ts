import { type RsbuildPlugin } from '@rsbuild/core';
import { NgtscProgram } from '@angular/compiler-cli';
import {
  FileEmitter,
  StyleUrlsResolver,
  TemplateUrlsResolver,
  SourceFileCache,
  augmentHostWithCaching,
  buildAndAnalyze,
  buildAndAnalyzeWithParallelCompilation,
  setupCompilation,
  setupCompilationWithParallelCompilation,
  JS_ALL_EXT_REGEX,
  TS_ALL_EXT_REGEX,
} from '@ng-rspack/compiler';
import { JavaScriptTransformer } from '@angular/build/src/tools/esbuild/javascript-transformer';
import * as ts from 'typescript';
import { PluginAngularOptions } from '../models/plugin-options';
import { maxWorkers } from '../utils/utils';
import { normalizeOptions } from '../models/normalize-options';
import { dirname, normalize, resolve } from 'path';
import { pluginAngularJit } from './plugin-angular-jit';
import { ChildProcess, fork } from 'node:child_process';

export const pluginAngular = (
  options: Partial<PluginAngularOptions> = {}
): RsbuildPlugin => ({
  name: 'plugin-angular',
  pre: ['plugin-hoisted-js-transformer'],
  post: ['plugin-angular-jit'],
  setup(api) {
    const pluginOptions = normalizeOptions(options);
    let watchMode = false;
    let nextProgram: NgtscProgram | undefined | ts.Program;
    let builderProgram: ts.EmitAndSemanticDiagnosticsBuilderProgram;
    let getFileEmitter: () => FileEmitter;
    let typescriptFileCache: Map<string, string> = new Map();
    let serverDevServerSendReload: () => void;
    let serverDevServer: ChildProcess | undefined;
    let isServer = pluginOptions.hasServer;
    const sourceFileCache = new SourceFileCache();
    const styleUrlsResolver = new StyleUrlsResolver();
    const templateUrlsResolver = new TemplateUrlsResolver();
    const javascriptTransformer = new JavaScriptTransformer(
      {
        sourcemap: false,
        thirdPartySourcemaps: false,
        advancedOptimizations: false,
        jit: pluginOptions.jit,
      },
      maxWorkers
    );
    const config = api.getRsbuildConfig();

    if (pluginOptions.useHoistedJavascriptProcessing) {
      const { typescriptFileCache: tsFCache, getFileEmitter: getEmitter } =
        api.useExposed('plugin-hoisted-js-transformer');
      getFileEmitter = getEmitter;
      typescriptFileCache = tsFCache;
    }

    if (pluginOptions.jit) {
      api.modifyRsbuildConfig((config) => {
        config.plugins ??= [];
        config.plugins.push(pluginAngularJit());
      });
    }

    api.modifyRspackConfig((config, { environment }) => {
      isServer = isServer && environment.name === 'server';
      return config;
    });

    api.modifyRsbuildConfig((config) => {
      if (isServer) {
        config.dev ??= {};
        config.dev.setupMiddlewares ??= [];
        config.dev.setupMiddlewares.push((middlewares, server) => {
          serverDevServerSendReload = () => {
            server.sockWrite('static-changed');
          };
        });
      }

      config.resolve ??= {};
      config.resolve.alias ??= {};
      for (const fileReplacement of options.fileReplacements ?? []) {
        config.resolve.alias[fileReplacement.replace] = fileReplacement.with;
      }
    });

    api.onDevCompileDone(({ environments }) => {
      if (isServer) {
        if (serverDevServer) {
          serverDevServer.kill();
          serverDevServer = undefined;
        }
        const pathToServerEntry = resolve(
          environments['server'].distPath,
          'server.js'
        );
        serverDevServer = fork(pathToServerEntry);
        serverDevServer.on('spawn', () => serverDevServerSendReload?.());
      }
    });

    if (isServer) {
      const regexForMainServer = new RegExp(
        `${pluginOptions.server!.replace('./', '')}`
      );
      api.transform({ test: regexForMainServer }, ({ code }) => {
        code = `globalThis['ngServerMode'] = true;\n${code}`;
        return code;
      });
    }

    api.onBeforeStartDevServer(() => {
      watchMode = true;
    });

    api.resolve(({ resolveData }) => {
      const request = resolveData.request;
      if (request.startsWith('angular:jit:')) {
        const path = request.split(';')[1];
        resolveData.request = `${normalize(
          resolve(dirname(resolveData.contextInfo.issuer), path)
        )}?raw`;
      }
    });

    if (!pluginOptions.useHoistedJavascriptProcessing) {
      api.onBeforeEnvironmentCompile(async () => {
        if (!pluginOptions.useParallelCompilation) {
          const { rootNames, compilerOptions, host } = await setupCompilation(
            config,
            pluginOptions,
            isServer
          );
          // Only store cache if in watch mode
          if (watchMode) {
            augmentHostWithCaching(host, sourceFileCache);
          }

          const emitter = await buildAndAnalyze(
            rootNames,
            host,
            compilerOptions,
            nextProgram,
            builderProgram,
            { watchMode, jit: pluginOptions.jit }
          );
          getFileEmitter = () => emitter;
        } else {
          const parallelCompilation =
            await setupCompilationWithParallelCompilation(
              config,
              pluginOptions
            );
          await buildAndAnalyzeWithParallelCompilation(
            parallelCompilation,
            typescriptFileCache,
            javascriptTransformer
          );
          await parallelCompilation.close();
        }
      });
    }

    api.transform(
      { test: TS_ALL_EXT_REGEX },
      async ({ code, resource, addDependency }) => {
        if (resource.includes('.ts?')) {
          // Strip the query string off the ID
          // in case of a dynamically loaded file
          resource = resource.replace(/\?(.*)/, '');
        }

        const templateUrls = templateUrlsResolver.resolve(code, resource);
        const styleUrls = styleUrlsResolver.resolve(code, resource);

        if (watchMode) {
          for (const urlSet of [...templateUrls, ...styleUrls]) {
            // `urlSet` is a string where a relative path is joined with an
            // absolute path using the `|` symbol.
            // For example: `./app.component.html|/home/projects/analog/src/app/app.component.html`.
            const [, absoluteFileUrl] = urlSet.split('|');
            addDependency(absoluteFileUrl);
          }
        }

        let data: string | undefined;
        if (!pluginOptions.useParallelCompilation) {
          const typescriptResult = await getFileEmitter?.()?.(resource);

          if (
            typescriptResult?.warnings &&
            typescriptResult?.warnings.length > 0
          ) {
            console.warn(`${typescriptResult.warnings.join('\n')}`);
          }

          if (typescriptResult?.errors && typescriptResult?.errors.length > 0) {
            console.error(`${typescriptResult.errors.join('\n')}`);
          }

          // return fileEmitter
          data = typescriptResult?.content ?? '';

          if (pluginOptions.jit && data.includes('angular:jit:')) {
            data = data.replace(
              /angular:jit:style:inline;/g,
              'virtual:angular:jit:style:inline;'
            );

            templateUrls.forEach((templateUrlSet) => {
              const [templateFile, resolvedTemplateUrl] =
                templateUrlSet.split('|');
              data = data?.replace(
                `angular:jit:template:file;${templateFile}`,
                `${resolvedTemplateUrl}?raw`
              );
            });

            styleUrls.forEach((styleUrlSet) => {
              const [styleFile, resolvedStyleUrl] = styleUrlSet.split('|');
              data = data?.replace(
                `angular:jit:style:file;${styleFile}`,
                `${resolvedStyleUrl}?inline`
              );
            });
          }
        } else {
          data = typescriptFileCache.get(resource);
          if (data === undefined) {
            return '';
          }
        }

        return data;
      }
    );

    if (!pluginOptions.useHoistedJavascriptProcessing) {
      api.transform({ test: JS_ALL_EXT_REGEX }, ({ code, resource }) => {
        if (!code.includes('@angular')) {
          return code;
        }
        const existingTransform = typescriptFileCache.get(resource);
        if (existingTransform) {
          return Buffer.from(existingTransform).toString();
        }
        return javascriptTransformer
          .transformData(resource, code, false, false)
          .then((contents: Uint8Array) => {
            const transformedCode = Buffer.from(contents).toString('utf8');
            typescriptFileCache.set(resource, transformedCode);
            return transformedCode;
          });
      });
    }

    if (pluginOptions.useParallelCompilation) {
      api.onCloseBuild(() => {
        process.exit();
      });
    }
  },
});
