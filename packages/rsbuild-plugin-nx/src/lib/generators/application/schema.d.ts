export interface AngularApplicationSchema {
  directory: string;
  name?: string;
  skipFormat?: boolean;
  inlineStyle?: boolean;
  inlineTemplate?: boolean;
  viewEncapsulation?: 'Emulated' | 'Native' | 'None';
  style?: 'css' | 'scss' | 'sass';
  tags?: string;
  linter?: 'eslint' | 'none';
  unitTestRunner?: 'jest' | 'none';
  e2eTestRunner?: 'playwright' | 'cypress' | 'none';
  strict?: boolean;
  ssr?: boolean;
  port?: number;
  setParserOptionsProject?: boolean;
  skipPackageJson?: boolean;
}
