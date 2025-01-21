# 🛠️ ESLint Next ⏭️

### Enterprise-Ready Code-Transformations ⏭️ <br/> Streamlined for ESLint 🛠️

---

Effortlessly **enable incremental migration of ESLint rules** with this automated script.

---

## **Overview** 📝

Modernizing and migrating your ESLint configurations can be challenging for large-scale projects. **ESLint Next Migration** simplifies this process with features like:

- ✅ **Idempotent Updates**: Safely adapts configurations for new code changes with every run.
- 💾 **Backup Configurations**: Retains the original setup for reference and progressive migration.
- 🔒 **Failproof Execution**: Ensures all lint targets pass by disabling problematic rules.
- 🔄 **Incremental Migration**: Gradually adopt new rules without overwhelming changes.
- 📊 **Progress Tracking**: Monitor migration progress through automated reports.

---

## **Core Features** 🌟

### 1. **Standalone and Package-Based Workspaces** 📂

This tool supports:

- **Standalone Workspaces**: Single `eslint.config.js` for the entire codebase.
- **Package-Based Workspaces**: Centralized configuration at the root with package-specific overrides.
- \*\*Nx first class citizen <3

### 2. **Automatic Migration** ⚙️

- 1. Creates a backup of the current configuration as `eslint.next.config.js`.
- 2. Updates the existing configuration to extend `eslint.next.config.js`.
- 3. Disables failing rules, allowing for incremental fixes.

Find all details about the process in out [migrations](./docs/migrations.md) documentation.

### 3. **Detailed Reporting** 📈

Generate comprehensive reports to track migration progress and identify problematic rules. Learn more in the [Reports Documentation](docs/report.md).

---

### Getting started

Run

```shell
npx eslint-next
```

**Before/After Comparison Overview**

| **View**                             | **Before**                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | **After**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Configuration**                    | `eslint.config.js`, <br>`package1/eslint.config.js`                                                                                                                                                                                                                                                                                                                                                                                                                                     | `eslint.config.js`, <br>`package1/eslint.config.js`, <br>`package1/eslint.next.config.js`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **File Structure**                   | <pre lang="javascript">project-root/&#10;├── eslint.config.js // 👈➕ new lint rule added&#10;└── packages/&#10; └── package1/&#10; └── eslint.config.js // ❌ linting fails</pre>                                                                                                                                                                                                                                                                                                      | <pre lang="javascript">project-root/&#10;├── eslint.config.js // 👈➕ new lint rule added&#10;└── packages/&#10; └── package1/&#10; ├── eslint.config.js // ✅ lint passing (failing rules are disabled)&#10; └── eslint.next.config.js // 💾 failing configuration (migration target)</pre>                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **`eslint.config.js`**               | <pre lang="javascript">const baseConfig = require('../../eslint.config.js');&#10;&#10;module.exports = [&#10; {&#10; files: ['**/*'],&#10; rules: {&#10; '@typescript-eslint/no-explicit-any': 'error',&#10; '@typescript-eslint/no-non-null-assertion': 'error',&#10; '@typescript-eslint/no-unused-vars': 'error',&#10; 'no-console': 'error',&#10; },&#10; },&#10; {&#10; files: ['*.test.ts', '**/test/**/*'],&#10; rules: {&#10; 'no-console': 'off',&#10; },&#10; },&#10;];</pre> | <pre lang="javascript">// file untouched</pre>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **`package1/eslint.config.js`**      | <pre lang="javascript">const baseConfig = require('../../eslint.config.js');&#10;&#10;module.exports = [&#10; {&#10; files: ['**/*'],&#10; rules: {&#10; '@typescript-eslint/no-non-null-assertion': 'off',&#10; },&#10; }&#10;];</pre>                                                                                                                                                                                                                                                 | <pre lang="javascript">const nextEslintConfig = require('./eslint.next.config'); // 👈 Import the eslint next config&#10;&#10;module.exports = [&#10; ...nextEslintConfig, // 👈 Extend the next config&#10; {&#10; files: ['**/*'],&#10; rules: {&#10; // ⚠️ Warnings: 3&#10; '@typescript-eslint/no-explicit-any': 'off', // ⚠️ 18 warnings&#10; '@typescript-eslint/no-non-null-assertion': 'off', // ⚠️ 7 warnings&#10; '@typescript-eslint/no-unused-vars': 'off', // ⚠️ 2 warnings&#10; },&#10; },&#10; {&#10; files: ['*.test.ts', '**/test/**/*'],&#10; rules: {&#10; // ❌️ Errors: 3&#10; '@typescript-eslint/no-non-null-assertion': 'off', // ❌️ 3 errors&#10; 'no-console': 'off', // ⚠️ 2 warnings&#10; },&#10; },&#10;];</pre> |
| **`package1/eslint.next.config.js`** | N/A                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | <pre lang="javascript">const baseConfig = require('../../eslint.config.js');&#10;&#10;module.exports = [&#10; {&#10; files: ['**/*'],&#10; rules: {&#10; '@typescript-eslint/no-non-null-assertion': 'off',&#10; },&#10; }&#10;];</pre>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

Change configurations, auto fix issues or manually disable rules. A subsequent run wil update the configuration to pass the lint process without violations.

## **Configuration Strategies** ⚖️

ESLint Next Migration supports flexible configuration strategies tailored to your project needs. Refer to the following strategies for detailed implementations:

1. **Root-Level Rules with Package Extensions**  
   Centralize rules at the root and extend them in package-specific configurations.  
   👉 See the [Root-Level Rules with Extensions Strategy](docs/eslint-strategies.md#1-root-level-general-rules-with-extensions-in-packages).

2. **Shared Configuration Package**  
   Create reusable shared configurations as a package, allowing packages to extend it.  
   👉 See the [Shared Configuration Package Strategy](docs/eslint-strategies.md#2-shared-configuration-package).

3. **Root Rules with Overrides**  
   Define all rules and overrides centrally in the root configuration.  
   👉 See the [Root Rules with Overrides Strategy](docs/eslint-strategies.md#3-root-rules-with-package-overrides).

4. **Independent Package Configurations**  
   Each package maintains its own ESLint configuration without extending root rules.  
   👉 See the [Independent Package Configurations Strategy](docs/eslint-strategies.md#4-independent-package-level-configurations).

---

## **Reports**

Reports help you to understand where low-hanging fruits or huge efforts are hidden.
[Smart sorting](./docs/report.md#smart-sorting) optimizes the review process.

The CLI serves the following reports:

- [Inline Report](./docs/report.md#inline-report)
- [Terminal Reports](./docs/report.md#terminal-report)
- [Md Reports](./docs/report.md#md-report)

## **Usage Examples** 📚

Explore practical scenarios to understand how to use ESLint Next Migration. Check out the following guides:

- [Initial-eslint-setup](./docs/usage-examples.md#1-initial-eslint-setup)
- [Adding new Rules](./docs/usage-examples.md#2-adding-new-rules)
- [Handling non-compliant code](./docs/usage-examples.md#3-handling-non-compliant-code)
- [Cleaning up after migration](./docs/usage-examples.md#4-cleaning-up-after-migration)

---

## **CLI Options** 🖥️

Learn more about available commands and options in the [CLI Documentation](docs/cli.md).

---
