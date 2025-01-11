import { withConfigurations } from '@ng-rsbuild/plugin-angular';
import { pluginSass } from '@rsbuild/plugin-sass';

const options = {
  browser: './src/main.ts',
  server: './src/main.server.ts',
  ssrEntry: './src/server.ts',
  inlineStylesExtension: 'scss' as any,
  styles: ['./src/styles.scss', './src/hljs.theme.scss'],
};

export default withConfigurations(
  {
    options,
    rsbuildConfigOverrides: {
      plugins: [pluginSass()],
    },
  },
  {
    production: {
      options: {
        fileReplacements: [
          {
            replace: './src/environments/environment.ts',
            with: './src/environments/environment.prod.ts',
          },
        ],
      },
    },
  }
);
