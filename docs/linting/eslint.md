## Linting with EsLint

### Configuration

The repositories projects hava a default linting target `lint`.  Every task has `0` configured as `maxWarnings`.

```json
{
  "targetDefaults": {
    "lint": {
      "options": {
        "maxWarnings": 0
      }
    }
  }
}
```

You can find more context about this setting in our [EsLint strategy](../../tools/scripts/eslint-next/docs/eslint-strategies.md) in the docs.

### Violation Categories

This repository has a strict categorisation of lint issues:

- **warnings** - code style only
- **problems** - bug prevention only

### Config Strategy

This repo has a [`Root-Level General Rules with Extensions in Packages`](../../tools/scripts/eslint-next/docs/eslint-strategies.md#5-combined-strategy-root-level-rules-with-shared-configurations) EsLint config strategy.

```shell
root
┣━━ 📂eslint
┃   ┗━━ 📂config
┃       ┣━━ angular.js
┃       ┗━━ vitest.js
┣━━ 📂apps
┃   ┣━━ 📂docs 
┃   ┃   ┗━━ eslint.config.js # extends root; uses angular.js
┃   ┣━━ 📂rsbuild 
┃   ┃   ┣━━ 📂csr  
┃   ┃   ┃   ┗━━ eslint.config.js # extends root; uses angular.js
┃   ┃   ┗━━ 📂ssr  
┃   ┃       ┗━━ eslint.config.js # extends root; uses angular.js
┃   ┗━━ 📂rspack 
┃       ┣━━ 📂... # similar to rsbuild, css and ssr folders
┣━━ 📂packages
┃   ┣━━ 📂build
┃   ┃   ┗━━ eslint.config.js # extends root; uses vitest.js
┃   ┣━━ 📂compiler
┃   ┃   ┗━━ eslint.config.js # extends root; uses vitest.js
┃   ┗━━ 📂...
┗━━ eslint.config.js # base rules
```

### EsLint Automations

We run the "[eslint next](./tools/scripts/eslint-next/README.md)" migration strategy.
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
