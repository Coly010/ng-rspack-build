<div style="text-align: center;">

# Angular Rspack and Rsbuild Tools

[![GitHub Actions](https://github.com/Coly010/ng-rspack-build/actions/workflows/ci.yml/badge.svg)](https://github.com/Coly010/ng-rspack-build/actions/workflows/ci.yml)
![License](https://img.shields.io/badge/License-MIT-blue)

[![NPM Version](https://img.shields.io/npm/v/%40ng-rspack%2Fbuild?label=%40ng-rspack%2Fbuild)](https://www.npmjs.com/package/@ng-rspack/build)
[![NPM Version](https://img.shields.io/npm/v/%40ng-rspack%2Fbuild?label=%40ng-rspack%2Fnx)](https://www.npmjs.com/package/@ng-rspack/nx)

</div>

<hr>

# Build Angular with Rspack and Rsbuild

The goal of `@ng-rspack/build` and `@ng-rspack/nx` is to make easy and straightforward to build Angular applications with [rspack](https://rspack.dev) and [rsbuild](https://rsbuild.dev).

## Rsbuild Support

Currently, the Rsbuild support is more feature complete than the Rspack support.
There exists an Rsbuild plugin that can be used with a `rspack.config.ts` file to support compiling Angular applications with Rsbuild.

### Setup

1. Install Rsbuild: `npm install --save-dev @rsbuild/core`
2. Install this plugin: `npm install --save-dev @ng-rspack/build`
3. Create an `rspack.config.ts` file at the root of your project with the following:

```ts
import { defineConfig } from '@rsbuild/core';
import { pluginAngular } from '@ng-rspack/build/rsbuild';

export default defineConfig({
  root: __dirname,
  plugins: [
    pluginAngular({
      root: __dirname,
      inlineStylesExtension: 'css',
      tsconfigPath: './tsconfig.app.json',
    }),
  ],
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  source: {
    preEntry: ['zone.js', './src/styles.css'],
    entry: { index: './src/main.ts' },
    assetsInclude: ['./public'],
    tsconfigPath: './tsconfig.app.json',
  },
  html: {
    template: './src/index.html',
  },
  server: {
    port: 4200,
    host: 'localhost',
  },
});
```

3. Run build: `npx rsbuild build`
4. Run dev (serve): `npx rsbuild dev`

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
