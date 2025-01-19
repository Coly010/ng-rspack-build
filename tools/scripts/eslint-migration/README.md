# EsLint Migration Next

This script enables incremental migration of EsLint rules.

## Key Features

- **Idempotent**: Running the script multiple times updates the configuration based on new code changes.
- **Backup and Extend**: Preserves the original ESLint configuration for reference and reusability.
- **Failproof Config**: Ensures all lint targets pass by disabling problematic rules.

## Usage

Run the script using `tsx`:

```bash
pnpx tsx --tsconfig tools/tsconfig.tools.json tools/scripts/eslint-migration/bin.ts
```

To simplify execution, ensure there is a script configured in package.json:

```jsonc
{
  // ...
  "scripts": {
    "migrate-eslint-next": "pnpx tsx --tsconfig tools/tsconfig.tools.json tools/scripts/eslint-migration/bin.ts"
  }
}
```

Run it with:

```bash
pnp migrate-eslint-next
```

### What happens

The script crawl the workspace for projects with `lint` targets.

For each project, it will:

1.  Copy the existing `eslint.config.js` to `eslint.next.config.js`. (if it does not already exist).

```ts
// new `eslint.next.config.js`
const baseConfig = require('../../eslint.config.js');

module.exports = [
  // ... your existing config from `eslint.config.js`
];
```

2.Update the existing `eslint.config.js`. It extends the existing config with the new rules and disables all failing rules with comments on the count.

```ts
// updated existing`eslint.config.js`
const nextEslintConfig = require('./eslint.next.config'); // 👈 Import the eslint next config

module.exports = [
  ...nextEslintConfig, // 👈 extend the next config
  // General failing rules for all files
  {
    files: ['**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // 12 errors
      '@typescript-eslint/no-unused-vars': 'off', // 5 warnings
    },
  },
  // Testing specific failing rules for all files
  {
    files: ['*.spec.ts', '*.test.ts', '**/test/**/*', '**/mock/**/*'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off', // 3 errors
      'no-console': 'off', // 2 warnings
    },
  },
];
```

Now all lint targets will pass. The script can get executed multiple times to update for code changes.
