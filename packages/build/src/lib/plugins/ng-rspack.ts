import {
  Compiler,
  CopyRspackPlugin,
  DefinePlugin,
  EntryPlugin,
  HtmlRspackPlugin,
  ProgressPlugin,
  RspackPluginInstance,
} from '@rspack/core';
import { basename, extname, join } from 'path';
import { RxjsEsmResolutionPlugin } from './rxjs-esm-resolution';
import { AngularRspackPlugin } from './angular';

export interface NgRspackPluginOptions {
  root: string;
  outputPath: string;
  name: string;
  main: string;
  index: string;
  tsConfig: string;
  styles?: string[];
  stylePreprocessorOptions?: { includePaths?: string[] }
  scripts?: string[];
  polyfills?: string[];
  assets?: string[];
  port?: number;
}

export class NgRspackPlugin implements RspackPluginInstance {
  pluginOptions: NgRspackPluginOptions;

  constructor(options: NgRspackPluginOptions) {
    this.pluginOptions = options;
  }

  apply(compiler: Compiler) {
    const isProduction = process.env['NODE_ENV'] === 'production';

    const polyfills = this.pluginOptions.polyfills ?? [];
    for (const polyfill of polyfills) {
      new EntryPlugin(compiler.context, polyfill, {
        name: isProduction ? this.getEntryName(polyfill) : undefined,
      }).apply(compiler);
    }
    const styles = this.pluginOptions.styles ?? [];
    for (const style of styles) {
      new EntryPlugin(compiler.context, style, {
        name: isProduction ? this.getEntryName(style) : undefined,
      }).apply(compiler);
    }
    const scripts = this.pluginOptions.scripts ?? [];
    for (const script of scripts) {
      new EntryPlugin(compiler.context, script, {
        name: isProduction ? this.getEntryName(script) : undefined,
      }).apply(compiler);
    }
    new DefinePlugin({
      ngDevMode: isProduction ? 'false' : 'undefined',
      ngJitMode: 'false',
    }).apply(compiler);
    if (this.pluginOptions.assets) {
      new CopyRspackPlugin({
        patterns: (this.pluginOptions.assets ?? []).map((assetPath) => ({
          from: join(this.pluginOptions.root, assetPath),
          to: '.',
          noErrorOnMissing: true,
        })),
      }).apply(compiler);
    }
    new ProgressPlugin().apply(compiler);
    new HtmlRspackPlugin({
      minify: false,
      inject: 'body',
      scriptLoading: 'module',
      template: join(this.pluginOptions.root, this.pluginOptions.index),
    }).apply(compiler);
    new RxjsEsmResolutionPlugin().apply(compiler);
    new AngularRspackPlugin({
      tsconfig: join(this.pluginOptions.root, this.pluginOptions.tsConfig),
    }).apply(compiler);
  }

  private getEntryName(path: string) {
    return basename(path, extname(path));
  }
}
