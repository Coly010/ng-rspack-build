import { createConfig } from '@ng-rsbuild/plugin-angular';

export default createConfig({
  browser: './src/main.ts',
  inlineStylesExtension: 'scss',
  styles: ['./src/styles.scss'],
});
