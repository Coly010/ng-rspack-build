export interface AngularRemoteSchema {
  directory: string;
  name?: string;
  host?: string;
  port?: number;
  style?: 'css' | 'scss' | 'sass';
  inlineStyle?: boolean;
  inlineTemplate?: boolean;
  skipPackageJson?: boolean;
  unitTestRunner?: 'jest' | 'none';
  e2eTestRunner?: 'playwright' | 'cypress' | 'none';
  linter?: 'eslint' | 'none';
  skipFormat?: boolean;
  setParserOptionsProject?: boolean;
  tags?: string;
}
