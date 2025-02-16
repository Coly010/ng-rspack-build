import { rule as vitestConfigHasTestCoverageConfigured, RULE_NAME as vitestConfigHasTestCoverageConfiguredName } from './rules/vitest-config-has-test-coverage-configured';
import { rule as vitestConfigHasUniqueCachedirConfigured, RULE_NAME as vitestConfigHasUniqueCachedirConfiguredName } from './rules/vitest-config-has-unique-cachedir-configured';
/**
 * Import your custom workspace rules at the top of this file.
 *
 * For example:
 *
 * import { RULE_NAME as myCustomRuleName, rule as myCustomRule } from './rules/my-custom-rule';
 *
 * In order to quickly get started with writing rules you can use the
 * following generator command and provide your desired rule name:
 *
 * ```sh
 * npx nx g @nx/eslint:workspace-rule {{ NEW_RULE_NAME }}
 * ```
 */

module.exports = {
  rules: {
    [vitestConfigHasTestCoverageConfiguredName]: vitestConfigHasTestCoverageConfigured,
    [vitestConfigHasUniqueCachedirConfiguredName]: vitestConfigHasUniqueCachedirConfigured
  },
};
