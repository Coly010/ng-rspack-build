import { ESLint } from 'eslint';
import { minimatch } from 'minimatch';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'url';
import { TEST_FILE_PATTERNS } from '../index';

type ConfigEntry = {
  files: string[];
  rules?: Record<string, string>;
};

export const parseExistingConfig = async (
  configPath: string,
  testFilePatterns = TEST_FILE_PATTERNS
): Promise<{ general: Set<string>; test: Set<string> }> => {
  if (!existsSync(configPath)) {
    return { general: new Set(), test: new Set() };
  }

  const configUrl = pathToFileURL(configPath);
  const config: ConfigEntry[] = (await import(configUrl.toString())).default;

  const generalRules = new Set<string>();
  const testRules = new Set<string>();

  config.forEach((entry) => {
    if (!entry.files || !Array.isArray(entry.files)) return;

    if (entry.files.includes('**/*')) {
      Object.keys(entry.rules || {}).forEach((ruleId) =>
        generalRules.add(ruleId)
      );
    } else if (
      testFilePatterns.some((pattern) => entry.files.includes(pattern))
    ) {
      Object.keys(entry.rules || {}).forEach((ruleId) => testRules.add(ruleId));
    }
  });

  return { general: generalRules, test: testRules };
};

export type RuleViolations = [number, boolean];
export type RuleCollection = Map<string, RuleViolations>;
export type RulesCollectionResult = {
  failingRules: RuleCollection;
  warningRules: RuleCollection;
  testFailingRules: RuleCollection;
  testWarningRules: RuleCollection;
};

export function collectRuleViolations(
  results: ESLint.LintResult[],
  testFilePatterns: string[]
): RulesCollectionResult {
  return results.reduce<RulesCollectionResult>(
    (acc, result) => {
      const isTestFile = testFilePatterns.some((pattern) =>
        minimatch(result.filePath, pattern)
      );

      result.messages.forEach(({ ruleId, severity, fix }) => {
        if (!ruleId) return;

        const ruleSet =
          isTestFile && severity === 1
            ? acc.testWarningRules
            : isTestFile
            ? acc.testFailingRules
            : severity === 1
            ? acc.warningRules
            : acc.failingRules;

        const [currentCount = 0, currentIsFixable = !!fix] =
          ruleSet.get(ruleId) ?? [];

        ruleSet.set(ruleId, [currentCount + 1, currentIsFixable || !!fix]);
      });

      return acc;
    },
    {
      failingRules: new Map(),
      warningRules: new Map(),
      testFailingRules: new Map(),
      testWarningRules: new Map(),
    }
  );
}

export type RuleCountSummary = {
  errors: number;
  warnings: number;
  fixable: boolean;
};
export type RuleSummary = {
  totalErrors: number;
  totalWarnings: number;
  fixableErrors: number;
  fixableWarnings: number;
  ruleCounts: Record<string, RuleCountSummary>;
};

export function aggregateRuleSummary(
  results: RulesCollectionResult
): RuleSummary {
  const summary: RuleSummary = {
    totalErrors: 0,
    totalWarnings: 0,
    fixableErrors: 0,
    fixableWarnings: 0,
    ruleCounts: {},
  };

  const processRuleCollection = (
    rules: RuleCollection,
    isError: boolean
  ): void => {
    rules.forEach(([count, isFixable], ruleId) => {
      // Update total counts
      if (isError) {
        summary.totalErrors += count;
        if (isFixable) summary.fixableErrors += count;
      } else {
        summary.totalWarnings += count;
        if (isFixable) summary.fixableWarnings += count;
      }

      // Update rule-specific counts
      if (!summary.ruleCounts[ruleId]) {
        summary.ruleCounts[ruleId] = { errors: 0, warnings: 0, fixable: false };
      }

      if (isError) {
        summary.ruleCounts[ruleId].errors += count;
      } else {
        summary.ruleCounts[ruleId].warnings += count;
      }

      if (isFixable) {
        summary.ruleCounts[ruleId].fixable = true;
      }
    });
  };

  // Process all rule collections
  processRuleCollection(results.failingRules, true);
  processRuleCollection(results.warningRules, false);
  processRuleCollection(results.testFailingRules, true);
  processRuleCollection(results.testWarningRules, false);

  return summary;
}

export function mergeRuleSummaries(summaries: RuleSummary[]): RuleSummary {
  return summaries.reduce<RuleSummary>(
    (merged, summary) => {
      // Merge total counts
      merged.totalErrors += summary.totalErrors;
      merged.totalWarnings += summary.totalWarnings;
      merged.fixableErrors += summary.fixableErrors;
      merged.fixableWarnings += summary.fixableWarnings;

      // Merge ruleCounts
      Object.entries(summary.ruleCounts).forEach(
        ([ruleId, { errors, warnings, fixable }]) => {
          if (!merged.ruleCounts[ruleId]) {
            merged.ruleCounts[ruleId] = {
              errors: 0,
              warnings: 0,
              fixable: false,
            };
          }

          merged.ruleCounts[ruleId].errors += errors;
          merged.ruleCounts[ruleId].warnings += warnings;

          // Mark as fixable if any summary marks it as fixable
          if (fixable) {
            merged.ruleCounts[ruleId].fixable = true;
          }
        }
      );

      return merged;
    },
    {
      totalErrors: 0,
      totalWarnings: 0,
      fixableErrors: 0,
      fixableWarnings: 0,
      ruleCounts: {},
    }
  );
}

export function sortByEffort(
  [ruleA, { errors: errorsA, warnings: warningsA, fixable: fixableA }]: [
    string,
    RuleCountSummary
  ],
  [ruleB, { errors: errorsB, warnings: warningsB, fixable: fixableB }]: [
    string,
    RuleCountSummary
  ]
) {
  // Sort by type ( ❌ errors > ⚠️ warnings)
  if (errorsA > 0 && warningsA === 0 && errorsB === 0 && warningsB > 0)
    return -1;
  if (errorsB > 0 && warningsB === 0 && errorsA === 0 && warningsA > 0)
    return 1;

  // Sort type errors by fixable (❌🛠 errors > ❌ errors)
  if (errorsA > 0 && errorsB > 0) {
    if (fixableA !== fixableB) return fixableB ? -1 : 1;
  }

  // Sort type warnings fixable (⚠️🛠 warnings > ⚠️ warnings)
  if (warningsA > 0 && warningsB > 0) {
    if (fixableA !== fixableB) return fixableB ? -1 : 1;
  }

  // Sort by total number of issues (❌ errors + ⚠️ warnings count descending)
  const totalA = errorsA + warningsA;
  const totalB = errorsB + warningsB;
  if (totalA !== totalB) return totalB - totalA;

  // Sort alphabetically by rule ID (❌ errors + ⚠️ warnings name descending)
  return ruleA.localeCompare(ruleB);
}

/**
 * Compares two rule entries for sorting by fixability, issue count, and rule ID.
 * @param a - The first rule entry ([ruleId, [count, fixable]]).
 * @param b - The second rule entry ([ruleId, [count, fixable]]).
 * @returns A number indicating the sort order.
 */
export function sortByFixable(
  [ruleA, [countA, fixableA]]: [string, RuleViolations],
  [ruleB, [countB, fixableB]]: [string, RuleViolations]
): number {
  // Sort by fixable (🛠❌⚠️ > ❌⚠️)
  if (fixableA !== fixableB) return fixableB ? 1 : -1;

  // Sort by number of issues (⚠️2 > ❌1)
  if (countB !== countA) return countB - countA;

  // Sort alphabetically by rule ID (a-rule > b-rule)
  return ruleA.localeCompare(ruleB);
}
