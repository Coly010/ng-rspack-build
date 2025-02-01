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
    const { typescriptFileCache, getFileEmitter } = api.useExposed(
      'plugin-hoisted-js-transformer'
    );
    let watchMode = false;
    let serverDevServerSendReload: () => void;
    let serverDevServer: ChildProcess | undefined;
    let isServer = pluginOptions.hasServer;
    const styleUrlsResolver = new StyleUrlsResolver();
    const templateUrlsResolver = new TemplateUrlsResolver();
    const config = api.getRsbuildConfig();

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

        const data = typescriptFileCache.get(resource);
        if (data === undefined) {
          return '';
        }

        return data;
      }
    );
  },
});
