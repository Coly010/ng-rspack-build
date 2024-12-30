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
import { setupCompilation } from './compilation/setup-compilation';
import { normalizeOptions } from '../models/normalize-options';
import { buildAndAnalyze } from './compilation/build-and-analyze';
import { augmentHostWithCaching } from './compilation/augments';
import { dirname, normalize, resolve } from 'path';
import { JS_EXT_REGEX, TS_EXT_REGEX } from './utils/regex-filters';
import { pluginAngularJit } from './plugin-angular-jit';

export const pluginAngular = (
  options: Partial<PluginAngularOptions> = {}
): RsbuildPlugin => ({
  name: 'plugin-angular',
  post: ['plugin-angular-jit'],
  setup(api) {
    const pluginOptions = normalizeOptions(options);
    let watchMode = false;
    let nextProgram: NgtscProgram | undefined | ts.Program;
    let builderProgram: ts.EmitAndSemanticDiagnosticsBuilderProgram;
    let fileEmitter: FileEmitter;
    let isServer = false;
    const sourceFileCache = new SourceFileCache();
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
    const config = api.getRsbuildConfig();
    if (pluginOptions.jit) {
      api.modifyRsbuildConfig((config) => {
        config.plugins ??= [];
        config.plugins.push(pluginAngularJit());
      });
    }

    api.modifyRspackConfig((config, { environment }) => {
      isServer = environment.name === 'server';
      return config;
    });

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

    api.onBeforeEnvironmentCompile(async () => {
      const { rootNames, compilerOptions, host } = setupCompilation(
        config,
        pluginOptions,
        isServer
      );

      // Only store cache if in watch mode
      // if (watchMode) {
      //   augmentHostWithCaching(host, sourceFileCache);
      // }

      fileEmitter = await buildAndAnalyze(
        rootNames,
        host,
        compilerOptions,
        nextProgram,
        builderProgram,
        { watchMode, jit: pluginOptions.jit }
      );
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

        const typescriptResult = await fileEmitter?.(resource);

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
        let data = typescriptResult?.content ?? '';

        if (pluginOptions.jit && data.includes('angular:jit:')) {
          data = data.replace(
            /angular:jit:style:inline;/g,
            'virtual:angular:jit:style:inline;'
          );

          templateUrls.forEach((templateUrlSet) => {
            const [templateFile, resolvedTemplateUrl] =
              templateUrlSet.split('|');
            data = data.replace(
              `angular:jit:template:file;${templateFile}`,
              `${resolvedTemplateUrl}?raw`
            );
          });

          styleUrls.forEach((styleUrlSet) => {
            const [styleFile, resolvedStyleUrl] = styleUrlSet.split('|');
            data = data.replace(
              `angular:jit:style:file;${styleFile}`,
              `${resolvedStyleUrl}?inline`
            );
          });
        }

        return data;
      }
    );

    api.transform({ test: JS_EXT_REGEX }, ({ code, resource }) => {
      if (!resource.includes('@angular')) {
        return code;
      }
      return javascriptTransformer
        .transformData(resource, code, false, false)
        .then((contents: Uint8Array) => {
          return Buffer.from(contents).toString('utf8');
        });
    });

    const regexForMainServer = new RegExp(
      `${pluginOptions.server.replace('./', '')}`
    );
    api.transform({ test: regexForMainServer }, ({ code }) => {
      code = `globalThis['ngServerMode'] = true;\n${code}`;
      return code;
    });
  },
});
