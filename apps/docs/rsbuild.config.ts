import { createConfig, pluginAngular } from '@ng-rsbuild/plugin-angular';
import { pluginSass } from '@rsbuild/plugin-sass';

const opts = {
  browser: './src/main.ts',
  server: './src/main.server.ts',
  ssrEntry: './src/server.ts',
  inlineStylesExtension: 'scss' as any,
  styles: ['./src/styles.scss', './src/hljs.theme.scss'],
};
export default createConfig(opts, {
  plugins: [pluginSass()],
});
