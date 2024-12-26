import { Compiler, RspackPluginInstance } from '@rspack/core';
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
  port?: number;
}
export declare class NgRspackPlugin implements RspackPluginInstance {
  pluginOptions: NgRspackPluginOptions;
  constructor(options: NgRspackPluginOptions);
  apply(compiler: Compiler): void;
  private getEntryName;
}
