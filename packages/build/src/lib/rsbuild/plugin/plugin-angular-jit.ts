import { PluginAngularOptions } from './models';
import type { RsbuildPlugin } from '@rsbuild/core';
import { compileString } from 'sass-embedded';

export const pluginAngularJit = (
  options: { inlineStylesExtension?: 'css' | 'scss' | 'sass' | 'less' } = {
    inlineStylesExtension: 'css',
  }
): RsbuildPlugin => ({
  name: 'plugin-angular-jit',
  setup(api) {
    api.resolve(({ resolveData }) => {
      const request = resolveData.request;
      if (request.startsWith('virtual:angular')) {
        resolveData.request = `\0${request}`;
      }
    });

    api.transform(
      { test: /virtual:angular:jit:style:inline;/ },
      ({ resource }) => {
        const styleId = resource.split('style:inline;')[1];

        const decodedStyles = Buffer.from(
          decodeURIComponent(styleId),
          'base64'
        ).toString();

        let styles: string | undefined = '';

        try {
          const compiled = compileString(decodedStyles);
          styles = compiled.css;
        } catch (e) {
          console.error(`${e}`);
        }

        return `export default \`${styles}\``;
      }
    );
  },
});
