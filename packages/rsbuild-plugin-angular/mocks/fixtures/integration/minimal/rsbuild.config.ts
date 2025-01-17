import { createConfig } from '../../../../src';

export default createConfig({
  browser: './src/main.ts',
  inlineStylesExtension: 'css',
  tsconfigPath: './mocks/fixtures/integration/minimal/tsconfig.basic.json',
});
