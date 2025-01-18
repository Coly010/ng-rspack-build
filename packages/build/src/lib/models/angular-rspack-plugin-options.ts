import type {
  FileReplacement,
  InlineStyleExtension,
} from '@ng-rspack/compiler';

export interface AngularRspackPluginOptions {
  root: string;
  main: string;
  polyfills: string[];
  assets: string[];
  styles: string[];
  scripts: string[];
  index?: string;
  fileReplacements: FileReplacement[];
  jit: boolean;
  inlineStylesExtension: InlineStyleExtension;
  tsconfigPath: string;
}
