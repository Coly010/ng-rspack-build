# Automated Migrations with EsLint-Next

## Project migration

This document describes the migration process of the `eslint-next` core logic.

---

**Comparison Overview**

| **View**                             | **Before**                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | **After**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Configuration**                    | `eslint.config.js`, <br>`package1/eslint.config.js`                                                                                                                                                                                                                                                                                                                                                                                                                                     | `eslint.config.js`, <br>`package1/eslint.config.js`, <br>`package1/eslint.next.config.js`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **File Structure**                   | <pre>project-root/&#10;├── eslint.config.js // 👈➕ new lint rule added&#10;└── packages/&#10; └── package1/&#10; └── eslint.config.js // ❌ linting fails</pre>                                                                                                                                                                                                                                                                                                                        | <pre>project-root/&#10;├── eslint.config.js // 👈➕ new lint rule added&#10;└── packages/&#10; └── package1/&#10; ├── eslint.config.js // ✅ lint passing (failing rules are disabled)&#10; └── eslint.next.config.js // 💾 failing configuration (migration target)</pre>                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **`eslint.config.js`**               | <pre lang="javascript">const baseConfig = require('../../eslint.config.js');&#10;&#10;module.exports = [&#10; {&#10; files: ['**/*'],&#10; rules: {&#10; '@typescript-eslint/no-explicit-any': 'error',&#10; '@typescript-eslint/no-non-null-assertion': 'error',&#10; '@typescript-eslint/no-unused-vars': 'error',&#10; 'no-console': 'error',&#10; },&#10; },&#10; {&#10; files: ['*.test.ts', '**/test/**/*'],&#10; rules: {&#10; 'no-console': 'off',&#10; },&#10; },&#10;];</pre> | <pre lang="javascript">// file untouched</pre>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **`package1/eslint.config.js`**      | <pre lang="javascript">const baseConfig = require('../../eslint.config.js');&#10;&#10;module.exports = [&#10; {&#10; files: ['**/*'],&#10; rules: {&#10; '@typescript-eslint/no-non-null-assertion': 'off',&#10; },&#10; }&#10;];</pre>                                                                                                                                                                                                                                                 | <pre lang="javascript">const nextEslintConfig = require('./eslint.next.config'); // 👈 Import the eslint next config&#10;&#10;module.exports = [&#10; ...nextEslintConfig, // 👈 Extend the next config&#10; {&#10; files: ['**/*'],&#10; rules: {&#10; // ⚠️ Warnings: 3&#10; '@typescript-eslint/no-explicit-any': 'off', // ⚠️ 18 warnings&#10; '@typescript-eslint/no-non-null-assertion': 'off', // ⚠️ 7 warnings&#10; '@typescript-eslint/no-unused-vars': 'off', // ⚠️ 2 warnings&#10; },&#10; },&#10; {&#10; files: ['*.test.ts', '**/test/**/*'],&#10; rules: {&#10; // ❌️ Errors: 3&#10; '@typescript-eslint/no-non-null-assertion': 'off', // ❌️ 3 errors&#10; 'no-console': 'off', // ⚠️ 2 warnings&#10; },&#10; },&#10;];</pre> |
| **`package1/eslint.next.config.js`** | N/A                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | <pre lang="javascript">const baseConfig = require('../../eslint.config.js');&#10;&#10;module.exports = [&#10; {&#10; files: ['**/*'],&#10; rules: {&#10; '@typescript-eslint/no-non-null-assertion': 'off',&#10; },&#10; }&#10;];</pre>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

---

## Precondition

ESLint is already set up, or a new lint rule is added, causing CI failures due to unresolved linting issues.

### File Structure

```shell
project-root/
├── eslint.config.js // 👈 initial setup or new lint rule added
└── packages/
    └── package1/
        └── eslint.config.js // ❌ linting fails
```

### Initial Configuration

**`eslint.config.js`**

```ts
module.exports = [
  {
    files: ['**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'no-console': 'error',
    },
  },
  {
    files: ['*.test.ts', '**/test/**/*'],
    rules: {
      'no-console': 'off',
    },
  },
];
```

**`packages/package1/eslint.config.js`**

```ts
const baseConfig = require('../../eslint.config.js');

module.exports = [
  {
    files: ['**/*'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
];
```

## Migration Process

### Step 1: Backup Configuration

The script creates a copy of the existing `eslint.config.js` as `eslint.next.config.js`, preserving the original configuration.

`eslint.next.config.js`:

```
const baseConfig = require('../../eslint.config.js');

module.exports = [
  {
    files: ['**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'no-console': 'error',
    },
  },
  {
    files: ['*.spec.ts', '**/test/**/*', '**/mock/**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warning',
      '@typescript-eslint/no-non-null-assertion': 'warning',
      '@typescript-eslint/no-unused-vars': 'warning',
      'no-console': 'warning',
    },
  },
];
```

### Step 2: Update Configuration

The script updates the existing `eslint.config.js`, extending it with the new `eslint.next.config.js`. Failing rules are temporarily disabled with comments noting error and warning counts.

```ts
const nextEslintConfig = require('./eslint.next.config'); // 👈 Import the eslint next config

module.exports = [
  ...nextEslintConfig, // 👈 Extend the next config
  {
    files: ['**/*'],
    rules: {
      // ⚠️ Warnings: 3
      '@typescript-eslint/no-non-null-assertion': 'off', // ⚠️ 7 warnings
      '@typescript-eslint/no-unused-vars': 'off', // ⚠️ 2 warnings
    },
  },
  {
    files: ['*.spec.ts', '*.test.ts', '**/test/**/*', '**/mock/**/*'],
    rules: {
      // ❌ Errors: 3
      '@typescript-eslint/no-non-null-assertion': 'off', // ❌ 3 errors
      // ⚠️ Warnings: 3
      'no-console': 'off', // ⚠️ 2 warnings
    },
  },
];
```

### Step 3: Generate Report (Optional)

By passing `--report` or `--report=reports/eslint-next.md` as arguments to the script, a report is generated summarizing the migration process.

```shell
npx eslint-next --report
```

```shell
npx eslint-next --report=reports/eslint-next.md
```

## Rule migration

Coming Soon
