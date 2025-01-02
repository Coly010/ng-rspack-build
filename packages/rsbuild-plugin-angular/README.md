<div style="text-align: center;">

<img src="http://github.com/Coly010/ng-rspack-build/raw/main/rsbuild-plugin-angular.png" alt="Rsbuild Plugin Angular" />

</div>

# @ng-rsbuild/plugin-angular

## Rsbuild Support for Angular

Plugin providing Rsbuild support for Angular applications, both SSR and CSR.

**_Thank you to [Brandon Roberts](https://x.com/brandontroberts) and [Analog](https://analogjs.org/) for their work on building Angular applications with Vite which both inspired this plugin and provided a basis for the compilation implementation._**

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

5. Run the builds: `npx rsbuild build`
6. Run the server: `node dist/server/server.js`
7. Run the dev server: `npx rsbuild dev`

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
