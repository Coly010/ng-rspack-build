# EsLint Next - Nx CLI

Effortlessly enable incremental migration of ESLint rules with this automation script.

---

## **Key Features**

- **Idempotent**: Safely updates configurations for new code changes with every run.
- **Backup & Extend**: Retains the original ESLint configuration as target configuration.
- **Failproof**: Ensures all lint targets pass by automatically disabling problematic rules.
- **Unlock Incremental Migration**: Gradually adopt new rules without overwhelming changes.
- **Progress Tracking**: Monitor migration progress without failing the CI.
- **Reporting**: Generate reports to track migration progress and efforts.

---

## Usage

When newly setting up eslint or when adding rules your CI task will fail.
In a big codebase, it is hard to fix all the issues at once.

This script will help you to disable failing rules and warnings and prepare to repository for incremental migration.

**Run eslint-next:**

```bash
pnpx eslint-next/nx --projects=project1,project2
```

| **Before**                                                                                                                                                                            | **After**                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <details open><summary>Failing setup</summary><pre><code>project-root/&#10;├── eslint.config.js&#10;└── packages/&#10; └── package1/&#10; └── eslint.config.js</code></pre></details> | <details open><summary>Prepared for Migration</summary><pre><code>project-root/&#10;├── eslint.root.config.js&#10;└── packages/&#10; └── package1/&#10; ├── eslint.config.js&#10; └── eslint.next.config.js</code></pre></details> |

### Options

| Option           | Type       | Default | Description                                                               |
| ---------------- | ---------- | ------- | ------------------------------------------------------------------------- |
| **`--root`**     | `boolean`  | `false` | Determines the workspace type.                                            |
| **`--report`**   | `boolean`  | `true`  | If true a report over all migrations is generated under `eslint-next.md`. |
| **`--projects`** | `string[]` | `false` | Filters matching projects. Only in combination with `--root` false.       |
