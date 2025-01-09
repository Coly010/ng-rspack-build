import { createConfig } from '@ng-rsbuild/plugin-angular';
import { pluginSass } from '@rsbuild/plugin-sass';

export default createConfig(
  {
    browser: './src/main.ts',
    server: './src/main.server.ts',
    ssrEntry: './src/server.ts',
    inlineStylesExtension: 'scss',
    styles: ['./src/styles.scss', './src/hljs.theme.scss'],
  },
  {
    plugins: [pluginSass()],
  }
);
