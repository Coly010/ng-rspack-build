import { createConfig } from './create-config';
import { osAgnosticPath } from '@ng-rspack/testing-utils';

describe('createConfig', () => {
  const root = process.cwd();

  it('should create a CSR config', () => {
    const config = createConfig({
      root,
      inlineStylesExtension: 'scss',
      tsconfigPath: './tsconfig.app.json',
    });
    expect(
      `const config = ${JSON.stringify(
        {
          ...config,
          root: config.root ? osAgnosticPath(config.root) : undefined,
        },
        null,
        2
      )}`
    ).toMatchFileSnapshot('__snapshots__/create-config.csr.js');
  });

  it('should create a SSR config', () => {
    const config = createConfig({
      root,
      server: './src/main.server.ts',
      ssrEntry: './src/server.ts',
      inlineStylesExtension: 'scss',
      tsconfigPath: './tsconfig.app.json',
    });

    expect(
      `const config = ${JSON.stringify(
        {
          ...config,
          root: config.root ? osAgnosticPath(config.root) : undefined,
        },
        null,
        2
      )}`
    ).toMatchFileSnapshot('__snapshots__/create-config.ssr.js');
  });
});
