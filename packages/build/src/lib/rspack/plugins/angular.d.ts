import { Compiler, RspackPluginInstance } from '@rspack/core';
import { JavaScriptTransformer } from '@angular/build/src/tools/esbuild/javascript-transformer';
import { FileReferenceTracker } from '@angular/build/src/tools/esbuild/angular/file-reference-tracker';
import { ParallelCompilation } from '@angular/build/src/tools/angular/compilation/parallel-compilation';
export declare class AngularRspackPlugin implements RspackPluginInstance {
  javascriptTransformer: JavaScriptTransformer;
  angularCompilation: ParallelCompilation;
  referencedFileTracker: FileReferenceTracker;
  typeScriptFileCache: Map<string, string | Uint8Array>;
  tsconfig: string;
  constructor(options: { tsconfig: string });
  apply(compiler: Compiler): void;
}
