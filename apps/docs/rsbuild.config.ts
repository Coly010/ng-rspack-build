import { pluginSass } from '@rsbuild/plugin-sass';

const options = {
  browser: './src/main.ts',
  server: './src/main.server.ts',
  ssrEntry: './src/server.ts',
  inlineStylesExtension: 'scss' as any,
  styles: ['./src/styles.scss', './src/hljs.theme.scss'],
  skipTypeChecking: true,
};

export default () => {
  if (global.NX_GRAPH_CREATION === undefined) {
    const { withConfigurations } = require('@ng-rsbuild/plugin-angular');
    return withConfigurations(
      {
        options,
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
  }
  return {};
};
