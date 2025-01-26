import type {
  FileReplacement,
  InlineStyleExtension,
} from '@ng-rspack/compiler';

export interface PluginAngularOptions {
  root: string;
  index: string;
  browser: string;
  server?: string;
  ssrEntry?: string;
  polyfills: string[];
  assets: string[];
  styles: string[];
  scripts: string[];
  fileReplacements: FileReplacement[];
  jit: boolean;
  inlineStylesExtension: InlineStyleExtension;
  tsconfigPath: string;
  hasServer: boolean;
  useParallelCompilation: boolean;
  useHoistedJavascriptProcessing: boolean;
}
