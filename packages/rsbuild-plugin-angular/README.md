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

createServer(bootstrap);
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
