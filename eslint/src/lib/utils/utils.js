// @ts-check

/**
 * Changes all errors to warnings in rule config.
 *
 * @param {Partial<import('eslint').Linter.RulesRecord> | undefined} rules - Rules config (e.g., recommended).
 * @returns {Partial<import('eslint').Linter.RulesRecord>}
 */
function convertErrorsToWarnings(rules) {
  return Object.fromEntries(
    Object.entries(rules ?? {}).map(([ruleId, entry]) => [
      ruleId,
      entry === 'error' || entry === 2 ? 'warn' : entry,
    ])
  );
}

module.exports = { convertErrorsToWarnings };
