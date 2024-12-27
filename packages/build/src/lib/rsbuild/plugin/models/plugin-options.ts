export interface PluginAngularOptions {
  root: string;
  jit: boolean;
  inlineStylesExtension: 'css' | 'scss' | 'sass' | 'less';
  tsconfigPath: string;
}
