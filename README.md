<div style="text-align: center; margin: 0 auto;">

<img src="./rsbuild-plugin-angular.png" alt="Rsbuild Plugin Angular" />

# Angular Rspack and Rsbuild Tools

[![GitHub Actions](https://github.com/Coly010/ng-rspack-build/actions/workflows/ci.yml/badge.svg)](https://github.com/Coly010/ng-rspack-build/actions/workflows/ci.yml)
![License](https://img.shields.io/badge/License-MIT-blue)

[![NPM Version](https://img.shields.io/npm/v/%40ng-rsbuild%2Fplugin-angular?label=%40ng-rsbuild%2Fpluigin-angular)](https://www.npmjs.com/package/@ng-rsbuild/plugin-angular)
[![NPM Version](https://img.shields.io/npm/v/%40ng-rsbuild%2Fplugin-nx?label=%40ng-rsbuild%2Fpluigin-nx)](https://www.npmjs.com/package/@ng-rsbuild/plugin-nx)
[![NPM Version](https://img.shields.io/npm/v/%40ng-rspack%2Fbuild?label=%40ng-rspack%2Fbuild)](https://www.npmjs.com/package/@ng-rspack/build)
[![NPM Version](https://img.shields.io/npm/v/%40ng-rspack%2Fbuild?label=%40ng-rspack%2Fnx)](https://www.npmjs.com/package/@ng-rspack/nx)

</div>

<hr>

# Build Angular with Rspack and Rsbuild

The goal of `@ng-rsbuild/plugin-angular` and `@ng-rspack/build` is to make it easy and straightforward to build Angular applications with [Rspack](https://rspack.dev) and [Rsbuild](https://rsbuild.dev).

## Feature Parity

The following aims to compare features of **Rspack** and **Rsbuild**, and it's Angular wrapper with **[Angular's standards](https://angular.dev/)** ([Angular CLI](https://github.com/angular/angular-cli) and [Webpack](https://webpack.js.org/)/[esbuild](https://esbuild.github.io/)).

Rspack and Rsbuild are modern, high-performance JavaScript build tools designed as alternatives to Webpack and other traditional bundlers.

### 📌 Mapping ng-rspack & ng-rsbuild Packages to Angular CLI Components

This table maps the key `ng-rspack` and `ng-rsbuild` packages to their equivalent Angular CLI components to show how Rspack and Rsbuild replace or mirror Angular CLI's system.

#### Package Comparison

| ng-rspack / ng-rsbuild Package                                                                                   | New Equivalent in Angular CLI / DevKit                                                              | Old Equivalent in Angular CLI / DevKit                                                                    | Description                                                                                      |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [@ng-rspack/build](https://github.com/Coly010/ng-rspack-build/tree/main/packages/build)                          | [@angular/build](https://github.com/angular/angular/tree/main/packages/build)                       | [@angular-devkit/build-angular](https://github.com/angular/angular-cli/tree/main/packages/angular_devkit) | Core build system for ng-rspack, replacing Angular CLI's Webpack-based builder.                  |
| [@ng-rspack/compiler](https://github.com/Coly010/ng-rspack-build/tree/main/packages/compiler)                    | [@angular/build](https://github.com/angular/angular/tree/main/packages/build)                       | [@angular/build](https://github.com/angular/angular/tree/main/packages/compiler)                          | Compiler for Angular applications using Rspack, leveraging abstractions from `@angular/build`.   |
| [@ng-rspack/nx](https://github.com/Coly010/ng-rspack-build/tree/main/packages/nx-plugin)                         | n/a ([@nx/angular](https://github.com/nrwl/nx/tree/master/packages/angular) as already 3rd party) | n/a ([@nx/angular](https://github.com/nrwl/nx/tree/master/packages/angular) as already 3rd party)       | Provides Nx integration for RsPack and RsBuild in Angular, like `@nx/angular` for Angular CLI. |
| [@ng-rsbuild/plugin-angular](https://github.com/Coly010/ng-rspack-build/tree/main/packages/build-plugin-angular) | [@angular/build](https://github.com/angular/angular/tree/main/packages/build) (Builder API)         | [@angular-devkit/build-angular](https://github.com/angular/angular-cli/tree/main/packages/angular_devkit) | Rsbuild plugin for Angular projects, similar to Angular CLI's Webpack-based builder API.         |
| [@ng-rsbuild/plugin-nx](https://github.com/Coly010/ng-rspack-build/tree/main/packages/build-plugin-nx)           | [@nx/angular](https://github.com/nrwl/nx/tree/master/packages/angular)                            | [@nx/angular](https://github.com/nrwl/nx/tree/master/packages/angular)                                  | Provides Nx integration for RsPack and RsBuild in Angular, like `@nx/angular` for Angular CLI. |

### Feature Comparisons

_Legend:_

- ✅ Fully Supported
- ⚠️ Partial Support
- ❌ Not Supported
- 🔘 Not Applicable
- 🌟 Best-in-Class

| Feature                                       | State | ng-rspack / ng-rsbuild Package                                                                                  | State | New Equivalent (@angular/build)                                               | State | Old Equivalent (@angular-devkit)                                                                          | Notes                                                                                                                       |
| --------------------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------- | ----- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Builder / Build Performance**               | ✅🌟  | [1] [Rspack](https://rspack.dev/) / [Rsbuild](https://github.com/web-infra-dev/rsbuild)                         | ✅    | [Angular Esbuild](https://angular.dev/guide/build#esbuild)                    | ⚠️    | [Webpack](https://webpack.js.org/)                                                                        | Rspack & Rsbuild (Rust-based) are optimized for performance. New Angular uses Esbuild, replacing Webpack for faster builds. |
| **Plugins & Loaders**                         | ✅    | -                                                                                                               | ✅    | -                                                                             | ✅    | -                                                                                                         |                                                                                                                             |
| - CSS Loader                                  | ✅    | [CSS Loader](https://rspack.dev/plugin/css/)                                                                    | ✅    | [CSS Loader](https://webpack.js.org/loaders/css-loader/)                      | ✅    | [CSS Loader](https://webpack.js.org/loaders/css-loader/)                                                  |                                                                                                                             |
| - SCSS/SASS Loader                            | ✅    | [SCSS Loader](https://rspack.dev/plugin/sass/)                                                                  | ✅    | [SCSS Loader](https://webpack.js.org/loaders/sass-loader/)                    | ✅    | [SCSS Loader](https://webpack.js.org/loaders/sass-loader/)                                                |                                                                                                                             |
| - LESS Loader                                 | ✅    | [LESS Loader](https://rspack.dev/plugin/less/)                                                                  | ✅    | [LESS Loader](https://webpack.js.org/loaders/less-loader/)                    | ✅    | [LESS Loader](https://webpack.js.org/loaders/less-loader/)                                                |                                                                                                                             |
| - Style Loader                                | 🚧    | [Style Loader](https://rspack.dev/plugin/style/)                                                                | ✅    | [Style Loader](https://webpack.js.org/loaders/style-loader/)                  | ✅    | [Style Loader](https://webpack.js.org/loaders/style-loader/)                                              |                                                                                                                             |
| **Configuration File (Bundler)**              | ✅    | [Rspack Config (`rspack.config.js`)](https://rspack.dev/config/)                                                | ✅    | [Angular JSON (`angular.json`)](https://angular.dev/guide/workspace-config)   | ✅    | [Webpack Config (`webpack.config.js`)](https://webpack.js.org/configuration/)                             | Angular combines bundler and builder configs in one file (`angular.json`)                                                   |
| **Configuration File (Builder)**              | ✅    | [Rsbuild Config (`rsbuild.config.ts`)](https://github.com/web-infra-dev/rsbuild)                                | ✅    | [Angular JSON (`angular.json`)](https://angular.dev/guide/workspace-config)   | ✅    | [Webpack Config (`webpack.config.js`)](https://webpack.js.org/configuration/)                             |                                                                                                                             |
| **Compiler**                                  | ✅    | [@ng-rspack/compiler](https://github.com/Coly010/ng-rspack-build/tree/main/packages/compiler)                  | ✅    | [@angular/build](https://github.com/angular/angular/tree/main/packages/build) | ✅    | [@angular/compiler](https://github.com/angular/angular/tree/main/packages/compiler)                       |                                                                                                                             |
| **Automatic Downleveling via `browserslist`** | ❌    | -                                                                                                               | ✅    | -                                                                             | ✅    | -                                                                                                         | Can be supported via [Rspack Target](https://rspack.dev/config/target#browserslist)                                         |
| **Build Flags (`NG_BUILD_MANGLE=0`, etc.)**   | ❌    | -                                                                                                               | ✅    | -                                                                             | ✅    | -                                                                                                         | No method to override SWC options                                                                                           |
| **HMR (Hot Module Replacement)**              | ⚠️   | [@ng-rspack/build](https://github.com/Coly010/ng-rspack-build/tree/main/packages/build)         [@ng-rsbuild/plugin-angular](https://github.com/Coly010/ng-rspack-build/tree/main/packages/rsbuild-plugin-angular)                | ✅    | [@angular/build](https://github.com/angular/angular/tree/main/packages/build) | ✅    | [@angular-devkit/build-angular](https://github.com/angular/angular-cli/tree/main/packages/angular_devkit) |                                                                                                                             |
| **TypeScript Handling**                       | ✅    | [Rspack SWC](https://rspack.dev/config/module#using-swc)                                                        | ✅    | [Angular Esbuild](https://angular.dev/guide/build#esbuild)                    | ✅    | [Webpack TypeScript](https://webpack.js.org/guides/typescript/)                                           | Rspack uses SWC, Angular uses Esbuild                                                                                       |
| **Tree Shaking**                              | ✅    | -                                                                                                               | ✅    | -                                                                             | ✅    | -                                                                                                         |                                                                                                                             |
| **Asset Management**                          | ✅    | -                                                                                                               | ✅    | -                                                                             | ✅    | -                                                                                                         |                                                                                                                             |
| **Development Server**                        | ✅    | -                                                                                                               | ✅    | -                                                                             | ✅    | -                                                                                                         |                                                                                                                             |
| **Schematics**                                | ⚠️    | -                                                                                                               | ✅    | -                                                                             | ✅    | -                                                                                                         |                                                                                                                             |
| - Generate Application                        | ⚠️    | -                                                                                                               | ✅    | `ng generate app`                                                             | ✅    | `ng generate app`                                                                                         |                                                                                                                             |
| - Serve Application                           | ✅    | -                                                                                                               | ✅    | `ng serve`                                                                    | ✅    | `ng serve`                                                                                                |                                                                                                                             |
| - Build Application                           | ✅    | -                                                                                                               | ✅    | `ng build`                                                                    | ✅    | `ng build`                                                                                                |                                                                                                                             |
| **Angular Plugin**                            | ✅    | [@ng-rspack/plugin-angular](https://github.com/Coly010/ng-rspack-build/tree/main/packages/build-plugin-angular) | ✅    | [@angular/build](https://github.com/angular/angular/tree/main/packages/build) | ✅    | [@angular-devkit/build-angular](https://github.com/angular/angular-cli/tree/main/packages/angular_devkit) |                                                                                                                             |
| **Nx Plugin**                                 | ✅    | [@ng-rspack/plugin-nx](https://github.com/Coly010/ng-rspack-build/tree/main/packages/build-plugin-nx)           | 🔘    | [@nx/angular](https://github.com/nrwl/nx/tree/master/packages/angular)      | 🔘    | [@nx/angular](https://github.com/nrwl/nx/tree/master/packages/angular)                                  | Nx is a 3rd party                                                                                                           |
| **Nx Integration**                            | ✅    | [@ng-rspack/nx](https://github.com/Coly010/ng-rspack-build/tree/main/packages/nx-plugin)                        | 🔘    | n/a                                                                           | 🔘    | n/a                                                                                                       | Already 3rd party ([`@nx/angular`](https://github.com/nrwl/nx/tree/master/packages/angular))                              |
| **Migration from Webpack**                    | ✅    | -                                                                                                               | ⚠️    | -                                                                             | ⚠️    | -                                                                                                         | Rspack serves as a drop-in replacement for Webpack; Angular is transitioning to Esbuild                                     |

- [1] For build speed comparison see [benchmarks](https://github.com/Coly010/ng-bundler-benchmark)

---

## Configuration

Configuration is **controlled entirely** via the **Rspack/Rsbuild config**.  
Both tools offer a `createConfig` function to **aid in the creation of the configuration**.

- [Rspack Configuration Guide](https://www.rspack.dev/docs/config/)
- [Rsbuild Configuration Guide](https://modern-js.dev/en/rsbuild/docs/config/)

## Documentation

The documentation for this project can be found at [angular-rspack.dev](https://angular-rspack.dev).

## Rsbuild Support

**_Thank you to [Brandon Roberts](https://x.com/brandontroberts) and [Analog](https://analogjs.org/) for their work on building Angular applications with Vite which both inspired this plugin and provided a basis for the compilation implementation._**

Currently, the Rsbuild support is more feature complete than the Rspack support.
There exists an Rsbuild plugin that can be used with a `rsbuild.config.ts` file to support compiling Angular applications with Rsbuild.

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

## Rspack Support

### Current Status: POC

Currently, this is still being viewed as a proof-of-concept.

There needs to be a lot more comprehensive testing before this is viable for real applications.

### Current Objective: HMR

The current objective is to get HMR working correctly.

Right now, the state of it is as follows:

- The global `ng` module is missing, causing warnings when HMR updates are applied.
- Only changes to the following cause an HMR update:
  - Global Styles
  - Inline Templates
  - TS portion of Components
- The following need support (non-exhaustive):
  - Inline Styles
  - Template Files
  - Component Style Files

## Getting started with `@ng-rspack/nx`

```bash
# Create a new nx workspace
npx create-nx-workspace ng-rspack-test
# Choose options:
# - Stack: None
# - Integrated Monorepo
# - CI: Do it later
# - Remote caching: Up to you

# Change into project directory and install the ng-rspack-build package
cd ng-rspack-test
npm install @ng-rspack/nx

# Run the app generator
npx nx g @ng-rspack/nx:app apps/myapp
# Choose stylesheet format and e2e framework

# Serve the app
npx nx serve myapp

# Build the app
npx nx build myapp

# Run the e2e tests
npx nx e2e myapp-e2e
```
