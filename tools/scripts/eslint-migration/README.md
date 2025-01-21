# **ESLint Next Automations**
Effortlessly enable incremental migration of ESLint rules with this automation script.

---

## **Key Features**
- **Idempotent**: Safely updates configurations for new code changes with every run.
- **Backup & Extend**: Retains the original ESLint configuration for reference and reusability.
- **Failproof**: Ensures all lint targets pass by automatically disabling problematic rules.

---

## **Motivation**
Migrating to a new ESLint configuration can be challenging, especially for large projects. Common hurdles include:
- **Too many errors**: New configurations generate numerous errors and warnings.
- **High effort**: Fixing all errors in one go is time-consuming.
- **Incremental migration**: Difficult to adopt rules gradually.
- **Tracking progress**: Monitoring migration progress is tedious.
- **Preserving configs**: Retaining original configurations for reference is often neglected.

---

## **Usage**

### **Run the Script**
Execute the migration plan using `tsx`:

```bash
pnpx tsx --tsconfig tools/tsconfig.tools.json tools/scripts/eslint-migration-plan/bin.ts
```

To make the process easier, configure a script in `package.json`:

```jsonc
{
  // ...
  "scripts": {
    "migrate-eslint-next": "pnpx tsx --tsconfig tools/tsconfig.tools.json tools/scripts/eslint-migration-plan/bin.ts"
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

2. Update the existing `eslint.config.js`. It extends the existing config with the new rules and disables all failing rules with comments on the count.

```ts
// updated existing`eslint.config.js`
const nextEslintConfig = require('./eslint.next.config'); // 👈 Import the eslint next config

module.exports = [
  ...nextEslintConfig, // 👈 extend the next config
  {
    files: ['**/*'],
    rules: {
      // ⚠️ Warnings: 3
      '@typescript-eslint/no-explicit-any': 'off', // ⚠️ 18 warnings
      '@typescript-eslint/no-non-null-assertion': 'off', // ⚠️ 7 warnings
      '@typescript-eslint/no-unused-vars': 'off', // ⚠️ 2 warnings
    },
  },
  {
    files: ['*.spec.ts', '*.test.ts', '**/test/**/*', '**/mock/**/*'],
    rules: {
      // ❌️ Errors: 3
      '@typescript-eslint/no-non-null-assertion': 'off', // ❌️ 3 errors
      // ⚠️ Warnings: 3
      'no-console': 'off', // ⚠️ 2 warnings
    },
  },
];
```

Now all lint targets will pass. The script can get executed multiple times to update for code changes.

## **Example Use Cases**

### **1. Initial ESLint Setup**
When enabling ESLint for the first time, you may encounter numerous errors and warnings. Use the script to streamline the process:

1. Set up ESLint in your project.
2. **Run the script**: Execute `pnpx eslint-migration-plan` to automatically disable all failing rules and warnings.
  - The script will create a backup configuration in `eslint.next.config.js`.
3. Incrementally address the disabled rules and warnings at your own pace.

---

### **2. Adding New Rules**
When introducing new rules to your ESLint configuration, this script ensures smooth integration:

1. Add the desired rule(s) to your ESLint configuration.
2. **Run the script**: Execute `pnpx eslint-migration-plan` to disable the new rule if it causes issues.
3. Gradually fix any violations introduced by the rule.

---

### **3. Handling Non-Compliant Code**
When adding new code that does not comply with existing ESLint rules, use the script to minimize disruption:

1. Add the non-compliant code to your project.
2. **Run the script**: Execute `pnpx eslint-migration-plan` to disable failing rules and warnings specific to the new code.
3. Gradually update the non-compliant code to meet your ESLint standards.

---

### **4. Cleaning Up After Migration**
Once all rules and warnings have been resolved, clean up redundant configuration files:

1. **Run the script**: Execute `pnpx eslint-migration-plan` to confirm that all rules pass. It removes the `eslint.next.config.js` file, as it is no longer needed.
2. Consolidate all migrated settings into your primary `eslint.config.js` file.  
