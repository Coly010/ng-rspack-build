export interface BuildExecutorSchema {
  outputPath: string;
  main: string;
  index: string;
  tsConfig: string;
  mode?: 'production' | 'development' | 'none';
  styles?: string[];
  scripts?: string[];
  polyfills?: string[];
  assets?: string[];
  customRspackConfig?: string;
  inlineStylesExtension?: 'css' | 'scss' | 'sass';
  jit?: boolean;
  fileReplacements?: {
    replace: string;
    with: string;
  }[];
}
