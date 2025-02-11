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

# lint projects affected by changes (compared to main branch)
npx nx affected:lint
```

## Linting

- The docs are located in the [./docs/linting/eslint.md](./docs/linting/eslint.md) folder.
- The configs in the [eslint](./eslint/README.md) folder.

## Testing

- The docs are located in the [./docs/testing/readme.md](./docs/testing/readme.md) folder.

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
| `type:app`          | application, e.g. e2e-css or example web app                           | `type:util` or `type:testing-util` |
| `type:util`         | general purpose utilities and types intended for reuse                 | `type:util` or `type:testing-util` |
| `type:e2e`          | E2E testing                                                            | `type:app` or `type:testing-util`  |
| `type:testing-util` | testing utilities                                                      | `type:util`                        |

## Special folders

The repository standards organize reusable code specific to a target in dedicated folders at project root level.
This helps to organize and share target related code. Note, all special targets also are applicable to the root directory.

The following optional folders can be present in a project root;

- `test` - test fixtures and utilities specific for a given project
- `docs` - files related to documentation
- `tooling` - tooling related code
