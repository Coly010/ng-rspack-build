# Example Use Case's for ESLint Next Migration

### 1. Initial ESLint Setup

- Set up ESLint in your project.
- **Run the script**: Execute the script to disable failing rules and warnings.
  - A backup will be created in `eslint.next.config.js`.
- Gradually fix disabled rules at your own pace.

---

### 2. Adding New Rules

- Add new rules to your ESLint configuration.
- **Run the script**: It will automatically disable the rules that fail.
- Incrementally resolve issues introduced by the new rules.

---

### 3. Handling Non-Compliant Code

- Add new, non-compliant code to your project.
- **Run the script**: It disables failing rules specific to the new code.
- Gradually update the non-compliant code to meet ESLint standards.

---

### 4. Cleaning Up After Migration

- **Run the script**: When all rules pass, it removes the `eslint.next.config.js` file.
- Consolidate settings into the primary `eslint.config.js`.

---

This structured approach ensures a seamless and scalable migration for both standalone and package-based repositories.
