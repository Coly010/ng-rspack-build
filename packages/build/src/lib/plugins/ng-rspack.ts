import {
  Compiler,
  CopyRspackPlugin,
  DefinePlugin,
  HtmlRspackPlugin,
  RspackPluginInstance,
} from '@rspack/core';
import { join } from 'path';
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
  scripts?: string[];
  polyfills?: string[];
  assets?: string[];
}

export class NgRspackPlugin implements RspackPluginInstance {
  pluginOptions: NgRspackPluginOptions;

  constructor(options: NgRspackPluginOptions) {
    this.pluginOptions = options;
  }

  apply(compiler: Compiler) {
    new DefinePlugin({
      ngDevMode: 'false',
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
}
