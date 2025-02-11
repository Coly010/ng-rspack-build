# Testing

## Test suites

On this project, we distinguish three types of functional tests by scope - unit tests, integration tests and E2E tests.
Unit and integration tests are written using [Vitest](https://vitest.dev/), e2e tests in [Playwright](https://playwright.dev/).

**Unit Tests:**

- Target Name: `unit-test`
- Test Config: `vitest.unit.config.ts`
- Test Files: `<filename>.unit.test.ts`

**Integration Tests:**

- Target Name: `unit-test`
- Test Config: `vitest.unit.config.ts`
- Test Files: `<filename>.unit.test.ts`

**E2E Tests:**

- Target Name: `unit-test`
- Test Config: `vitest.unit.config.ts`
- Test Files: `<filename>.unit.test.ts`

Integration and unit tests are colocated:

```shell
project-root/
└── packages/
    ├── build/
    │   ├── test //
    │   │   └── fixtures //
    │   │   └── utils //
    │   │   └── mocks //
    │   ├── src
    │   │   └── <filename>.unit.test.ts //
    │   │   └── <filename>.integration.test.ts //
    │   ├── vitest.unit.config.ts //
    │   └── vitest.integration.config.ts //
    └── ...
```

Tests E2E tests are in a separate project:

```shell
project-root/

├── e2e/
│   └──build-e2e
│      └── test
│          └── <filename>.e2e.test.ts
└── packages/
    ├── build/
    │   └── src
    └── ...
```

## `vitest-setup` - Vitest Mocking

Each test suite has a predefined set of setup files which mock appropriate parts of the logic.
These mock setups may be found in the [vitest-setup](./testing/vitest-setup) folder of the `testing-utils` library.

```ts
export default defineConfig({
  test: {
    include: ['src/**/*.{test}.{ts}'],
    setupFiles: ['../../testing/vitest-setup/fs-memfs.setup-file.ts'],
    passWithNoTests: true,
  },
});
```

## `utils` - Test Utils

In order to **keep the signal-to-noise ratio low**, we maintain testing utilities in the package `utils`.
Any fixtures, helper functions, constants or mocks usable by multiple tests should be added to the [utils](./testing/utils) subfolder.

The folder structure should be:

- `fixtures` for fixed data or examples
- `utils` for utility functions

The exception to this may be a utility which is applicable only to the current package.
In this case, each package shall use the `test` folder to mirror the hierarchy of the `utils`
TypeScript is set up to include this folder only for its test configuration.
