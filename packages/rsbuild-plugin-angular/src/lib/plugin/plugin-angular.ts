import { type RsbuildPlugin } from '@rsbuild/core';
import { NgtscProgram } from '@angular/compiler-cli';
import { JavaScriptTransformer } from '@angular/build/src/tools/esbuild/javascript-transformer';
import * as ts from 'typescript';
import { FileEmitter } from './models';
import { PluginAngularOptions } from '../models/plugin-options';
import {
  StyleUrlsResolver,
  TemplateUrlsResolver,
} from './utils/component-resolvers';
import { maxWorkers } from '../utils/utils';
import { SourceFileCache } from './utils/devkit';
import {
  setupCompilation,
  setupCompilationWithParallelCompiltation,
} from './compilation/setup-compilation';
import { normalizeOptions } from '../models/normalize-options';
import {
  buildAndAnalyze,
  buildAndAnalyzeWithParallelCompilation,
} from './compilation/build-and-analyze';
import { augmentHostWithCaching } from './compilation/augments';
import { dirname, normalize, resolve } from 'path';
import { JS_EXT_REGEX, TS_EXT_REGEX } from './utils/regex-filters';
import { pluginAngularJit } from './plugin-angular-jit';
import { ChildProcess, fork } from 'node:child_process';

export const pluginAngular = (
  options: Partial<PluginAngularOptions> = {}
): RsbuildPlugin => ({
  name: 'plugin-angular',
  pre: ['plugin-cache-provider'],
  post: ['plugin-angular-jit'],
  setup(api) {
    const pluginOptions = normalizeOptions(options);
    let watchMode = false;
    let serverDevServerSendReload: () => void;
    let serverDevServer: ChildProcess | undefined;
    let isServer = pluginOptions.hasServer;
    const { typescriptFileCache, getFileEmitter } = api.useExposed(
      'plugin-cache-provider'
    );
    const styleUrlsResolver = new StyleUrlsResolver();
    const templateUrlsResolver = new TemplateUrlsResolver();
    const javascriptTransformer = new JavaScriptTransformer(
      {
        sourcemap: false,
        thirdPartySourcemaps: false,
        advancedOptimizations: false,
        jit: false,
      },
      maxWorkers
    );
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

    api.transform(
      { test: TS_EXT_REGEX },
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

        let data: string | Uint8Array | undefined;
        if (!pluginOptions.useExperimentalParallelCompilation) {
          const typescriptResult = await getFileEmitter()?.(resource);

          if (
            typescriptResult?.warnings &&
            typescriptResult?.warnings.length > 0
          ) {
            console.warn(`${typescriptResult.warnings.join('\n')}`);
          }

          if (typescriptResult?.errors && typescriptResult?.errors.length > 0) {
            console.error(`${typescriptResult.errors.join('\n')}`);
          }

          data = typescriptResult?.content ?? '';
        } else {
          data = typescriptFileCache.get(resource);
          if (data === undefined) {
            return '';
          } else if (typeof data === 'string') {
            await javascriptTransformer
              .transformData(resource, data, true /* skipLinker */, false)
              .then((contents) => {
                // Store as the returned Uint8Array to allow caching the fully transformed code
                typescriptFileCache.set(resource, contents);
                data = Buffer.from(contents).toString();
              });
          } else {
            data = Buffer.from(data).toString();
          }
        }

        data = data as string;

        if (pluginOptions.jit && data.includes('angular:jit:')) {
          data = data.replace(
            /angular:jit:style:inline;/g,
            'virtual:angular:jit:style:inline;'
          );

          templateUrls.forEach((templateUrlSet) => {
            const [templateFile, resolvedTemplateUrl] =
              templateUrlSet.split('|');
            data = (data as string).replace(
              `angular:jit:template:file;${templateFile}`,
              `${resolvedTemplateUrl}?raw`
            );
          });

          styleUrls.forEach((styleUrlSet) => {
            const [styleFile, resolvedStyleUrl] = styleUrlSet.split('|');
            data = (data as string).replace(
              `angular:jit:style:file;${styleFile}`,
              `${resolvedStyleUrl}?inline`
            );
          });
        }

        return data;
      }
    );
  },
});
