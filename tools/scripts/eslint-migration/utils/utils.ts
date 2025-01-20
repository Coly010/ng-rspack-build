import { ESLint } from 'eslint';
import { minimatch } from 'minimatch';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'url';
import { TEST_FILE_PATTERNS } from '../index';
import { bold, green, red, yellow } from 'colorette';

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

export type RuleSummary = {
  totalErrors: number;
  totalWarnings: number;
  fixableErrors: number;
  fixableWarnings: number;
  ruleCounts: Record<string, { errors: number; warnings: number; fixable: boolean }>;
};

/**
 * Aggregates rule violations from a RulesCollectionResult into a summary.
 */
export function aggregateRuleSummary(results: RulesCollectionResult): RuleSummary {
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
      Object.entries(summary.ruleCounts).forEach(([ruleId, { errors, warnings, fixable }]) => {
        if (!merged.ruleCounts[ruleId]) {
          merged.ruleCounts[ruleId] = { errors: 0, warnings: 0, fixable: false };
        }

        merged.ruleCounts[ruleId].errors += errors;
        merged.ruleCounts[ruleId].warnings += warnings;

        // Mark as fixable if any summary marks it as fixable
        if (fixable) {
          merged.ruleCounts[ruleId].fixable = true;
        }
      });

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


export function printRuleSummary(summary: RuleSummary): void {
  console.log(bold("ESLint Rule Summary:\n"));

  console.log(`${green("✔ Fixable Errors:")} ${bold(summary.fixableErrors)}`);
  console.log(`${green("✔ Fixable Warnings:")} ${bold(summary.fixableWarnings)}`);
  console.log(`${red("❌ Total:")} ${bold(summary.totalErrors)}`);
  console.log(`${yellow("⚠️ Total:")} ${bold(summary.totalWarnings)}\n`);

  console.log(bold("Rule Details:"));

  Object.entries(summary.ruleCounts)
    .sort(([_, a], [__, b]) => {
      // Sort non-fixable rules first, then by total issues (errors + warnings), then alphabetically
      if (a.fixable !== b.fixable) return a.fixable ? 1 : -1;
      const totalA = a.errors + a.warnings;
      const totalB = b.errors + b.warnings;
      if (totalA !== totalB) return totalB - totalA;
      return _.localeCompare(__);
    })
    .forEach(([ruleId, { errors, warnings, fixable }]) => {
      const errorPart = errors ? `${red(`❌ ${errors}`)}` : "";
      const warningPart = warnings ? `${yellow(`⚠️ ${warnings}`)}` : "";
      const fixableTag = fixable ? green("🛠️") : "";

      console.log(
        `- ${bold(ruleId)}: ${[errorPart, warningPart]
          .filter(Boolean)
          .join(", ")} ${fixableTag}`
      );
    });

  console.log("\n");
}
