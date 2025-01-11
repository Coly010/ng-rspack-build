export interface FileReplacement {
  replace: string;
  with: string;
}

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
  inlineStylesExtension: 'css' | 'scss' | 'sass' | 'less';
  tsconfigPath: string;
  hasServer: boolean;
  useParallelCompilation: boolean;
  useHoistedJavascriptProcessing: boolean;
}
