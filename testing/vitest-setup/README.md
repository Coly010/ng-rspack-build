# testing-vitest-setup

This library provides a set of setup scripts for testing.
As this package is never directly referenced, but only it's files it does not maintain a `index.ts` entry point.

## The many content divides into:

- **Setup files** - obey to the naming pattern `<purpose>-setup-file.ts` and should be used in a `vite.config.ts` testing config under the `setupFiles` property.
- **Global setup files** - obey to the naming pattern `<purpose>-global-setup-file.ts` and should be used in a `vite.config.ts` testing config under the `globalSetup` property.
