<div style="text-align: center;">

# Angular Rspack Tools

[![GitHub Actions](https://github.com/Coly010/ng-rspack-build/actions/workflows/ci.yml/badge.svg)](https://github.com/Coly010/ng-rspack-build/actions/workflows/ci.yml)
![License](https://img.shields.io/badge/License-MIT-blue)

[![NPM Version](https://img.shields.io/npm/v/%40ng-rspack%2Fbuild?label=%40ng-rspack%2Fbuild)](https://www.npmjs.com/package/@ng-rspack/build)
[![NPM Version](https://img.shields.io/npm/v/%40ng-rspack%2Fbuild?label=%40ng-rspack%2Fnx)](https://www.npmjs.com/package/@ng-rspack/nx)
</div>

<hr>

# Build Angular with Rspack

The goal of `@ng-rspack/build` and `@ng-rspack/nx` is to make easy and straightforward to build Angular applications with [rspack](https://rspack.dev).

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

## Getting started
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