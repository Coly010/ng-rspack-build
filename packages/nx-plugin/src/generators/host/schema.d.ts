export interface AngularHostSchema {
  directory: string;
  name?: string;
  remotes?: string[];
  dynamic?: boolean;
  style?: 'css' | 'scss' | 'sass';
  inlineStyle?: boolean;
  inlineTemplate?: boolean;
  viewEncapsulation?: 'Emulated' | 'Native' | 'None';
  skipPackageJson?: boolean;
  unitTestRunner?: 'jest' | 'none';
  e2eTestRunner?: 'playwright' | 'cypress' | 'none';
  linter?: 'eslint' | 'none';
  setParserOptionsProject?: boolean;
  skipFormat?: boolean;
  tags?: string;
}
