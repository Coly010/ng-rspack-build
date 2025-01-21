# Contributing

## Setup

Prerequisites:

- Node.js installed (LTS version)

Make sure to install dependencies:

```sh
pnpm install
```

## Development

Refer to docs on [how to run tasks in Nx](https://nx.dev/core-features/run-tasks).

Some examples:

```sh
# visualize project graph
npx nx graph

# run unit tests for all projects
npx nx run-many -t unit-test

# run integration tests for all projects
npx nx run-many -t integration-test

# run E2E tests for CLI
npx nx e2e css-e2e

# build CLI along with packages it depends on
npx nx build css

# lint projects affected by changes (compared to main branch)
npx nx affected:lint
```

## Lint

### CLI Configuration

This projects has a default linting target `lint`. Every task has 0 configured as `maxWarnings`.

### Violation Categories

This repository has a strict categorisation of lint issues:

- **warnings** - code style only
- **problems** - bug prevention only

### Config Strategy

This repo maintains a `Root-Level General Rules with Extensions in Packages` EsLint config strategy.

```shell
project-root/
  ├── eslint.config.js
  └── packages/
      ├── frontend/
      │   └── eslint.config.js
      └── backend/
          └── eslint.config.js
```

#### Configuration

`eslint.config.js`

```javascript
module.exports = {
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
  },
};
```

`packages/frontend/eslint.config.js`

```javascript
const rootConfig = require('../../eslint.config');

module.exports = {
  ...rootConfig,
  rules: {
    ...rootConfig.rules,
    'no-console': 'off', // Override root rule
  },
};
```

### EsLint Migration

We run the "eslint next" migration strategy.
That means we maintain a second config that maintains the target rules `eslint.next.config.js` and a default config `eslint.config.js` that has all faining rules enabled.

After every change on EsLint rule migrations run the update script to keep your configurations automatically in sync.

```sh
pnpm `eslint-next/nx`
```

This will update all projects.

```sh
pnpm `eslint-next/nx --projects=build`
```

For subset of projects.

For more detail read the [`eslint-next` docs](./tools/scripts/eslint-next/README.md).

## Testing

### Test suites

On this project, we distinguish three types of functional tests by scope - unit tests, integration tests and E2E tests.
Unit and integration tests are written using [Vitest](https://vitest.dev/), e2e tests in [playwrite]().

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

### `vitest-setup` - Vitest Mocking

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

### `utils` - Test Utils

In order to **keep the signal-to-noise ratio low**, we maintain testing utilities in the package `utils`.
Any fixtures, helper functions, constants or mocks usable by multiple tests should be added to the [utils](./testing/utils) subfolder.

The folder structure should be:

- `fixtures` for fixed data or examples
- `utils` for utility functions

The exception to this may be a utility which is applicable only to the current package.
In this case, each package shall use the `test` folder to mirror the hierarchy of the `utils`
TypeScript is set up to include this folder only for its test configuration.

## Git

Commit messages must follow [conventional commits](https://conventionalcommits.org/) format.
In order to be prompted with supported types and scopes, stage your changes and run `npm run commit`.

Branching strategy follows [trunk-based development](https://www.atlassian.com/continuous-delivery/continuous-integration/trunk-based-development) guidelines.
Pushing to remote triggers a CI workflow, which runs automated checks on your changes.

The main branch should always have a linear history.
Therefore, PRs are merged via one of two strategies:

- rebase - branch cannot contain merge commits ([rebase instead of merge](https://www.atlassian.com/git/tutorials/merging-vs-rebasing)),
- squash - single commit whose message is the PR title (should be in conventional commit format).

## Project tags

[Nx tags](https://nx.dev/core-features/enforce-module-boundaries) are used to enforce module boundaries in the project graph when linting.

Projects are tagged in two different dimensions - scope and type:

| tag                 | description                                                            | allowed dependencies               |
| :------------------ | :--------------------------------------------------------------------- | :--------------------------------- |
| `scope:shared`      | data models, utility functions, etc. (not specific to core or plugins) | `scope:shared`                     |
| `scope:tooling`     | supplementary tooling, e.g. code generation                            | `scope:tooling`, `scope:shared`    |
| `scope:internal`    | internal project, e.g. example plugin                                  | any                                |
| `type:app`          | application, e.g. CLI or example web app                               | `type:util` or `type:testing-util` |
| `type:util`         | general purpose utilities and types intended for reuse                 | `type:util` or `type:testing-util` |
| `type:e2e`          | E2E testing                                                            | `type:app` or `type:testing-util`  |
| `type:testing-util` | testing utilities                                                      | `type:util`                        |

## Special targets

The repository includes a couple of common optional targets:

- `bench` - runs micro benchmarks of a project e.g. `nx bench utils` or `nx affected -t bench`

## Special folders

The repository standards organize reusable code specific to a target in dedicated folders at project root level.
This helps to organize and share target related code.

The following optional folders can be present in a project root;

- `test` - test fixtures and utilities specific for a given project
- `bench` - micro benchmarks related code
- `docs` - files related to documentation
- `tooling` - tooling related code
