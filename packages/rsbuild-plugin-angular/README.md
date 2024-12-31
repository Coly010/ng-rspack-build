# @ng-rsbuild/plugin-angular

## Rsbuild Support for Angular

Plugin providing Rsbuild support for Angular applications, both SSR and CSR.

**_Thank you to [Brandon Roberts](https://x.com/brandontroberts) and [Analog](https://analogjs.org/) for their work on building Angular applications with Vite which both inspired this plugin and provided a basis for the compilation implementation._**

Currently, the Rsbuild support is more feature complete than the Rspack support.
There exists an Rsbuild plugin that can be used with a `rspack.config.ts` file to support compiling Angular applications with Rsbuild.

### Setup for SSR Application

**Prerequisites**: Angular SSR Application already created with `ng new --ssr`.

1. Install Rsbuild: `npm install --save-dev @rsbuild/core`
2. Install this plugin: `npm install --save-dev @ng-rsbuild/plugin-angular`
3. Create an `rsbuild.config.ts` file at the root of your project with the following:

```ts
import { createConfig } from '@ng-rsbuild/plugin-angular';

export default createConfig({
  browser: './src/main.ts',
  server: './src/main.server.ts',
  ssrEntry: './src/server.ts',
});
```

4. Update your `./src/server.ts` file to use the `createServer` util:

```ts
import { createServer } from '@ng-rsbuild/plugin-angular/ssr';
import bootstrap from './main.server';

const server = createServer(bootstrap);

/** Add your custom server logic here
 *
 * For example, you can add a custom static file server:
 *
 * server.app.use('/static', express.static(staticFolder));
 *
 * Or add additional api routes:
 *
 * server.app.get('/api/hello', (req, res) => {
 *   res.send('Hello World!');
 * });
 *
 * Or add additional middleware:
 *
 * server.app.use((req, res, next) => {
 *   res.send('Hello World!');
 * });
 */

server.listen();
```

5. Run the builds: `npx rsbuild build --environment browser && npx rsbuild build --environment server`
6. Run the server: `node dist/server/server.js`

### Setup for CSR Application

**Prerequisites**: Angular CSR Application already created with `ng new`.

1. Install Rsbuild: `npm install --save-dev @rsbuild/core`
2. Install this plugin: `npm install --save-dev @ng-rsbuild/plugin-angular`
3. Create an `rsbuild.config.ts` file at the root of your project with the following:

```ts
import { createConfig } from '@ng-rsbuild/plugin-angular';

export default createConfig({
  browser: './src/main.ts',
});
```

4. Run the builds: `npx rsbuild build`
5. Run the dev server: `npx rsbuild dev`
