import { ESLint } from 'eslint';
import { minimatch } from 'minimatch';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'url';
import { TEST_FILE_PATTERNS } from '../index';
import { bold, green, red, yellow } from 'ansis';

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
  ruleCounts: Record<
    string,
    { errors: number; warnings: number; fixable: boolean }
  >;
};

/**
 * Aggregates rule violations from a RulesCollectionResult into a summary.
 */
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

export function printRuleSummary(summary: RuleSummary): void {
  console.log(bold('ESLint Rule Summary:\n'));

  console.log(
    `${green(`✔ 🛠️ Fixable Errors: ${bold(summary.fixableErrors)}`)}`
  );
  console.log(
    `${green(`✔ 🛠️ Fixable Warnings: ${bold(summary.fixableWarnings)}`)}`
  );
  console.log(`${red(`❌ Total Errors: ${bold(summary.totalErrors)}`)}`);
  console.log(
    `${yellow(`⚠️ Total Warnings: ${bold(summary.totalWarnings)}`)}\n`
  );

  console.log(bold('Rule Details By Effort:'));

  Object.entries(summary.ruleCounts)
    .sort(
      (
        [ruleA, { errors: errorsA, warnings: warningsA, fixable: fixableA }],
        [ruleB, { errors: errorsB, warnings: warningsB, fixable: fixableB }]
      ) => {
        // Sort by type (errors before warnings)
        if (errorsA > 0 && warningsA === 0 && errorsB === 0 && warningsB > 0)
          return -1;
        if (errorsB > 0 && warningsB === 0 && errorsA === 0 && warningsA > 0)
          return 1;

        // Sort fixable errors before non-fixable
        if (errorsA > 0 && errorsB > 0) {
          if (fixableA !== fixableB) return fixableB ? -1 : 1;
        }

        // Sort fixable warnings before non-fixable
        if (warningsA > 0 && warningsB > 0) {
          if (fixableA !== fixableB) return fixableB ? -1 : 1;
        }

        // Sort by total number of issues (errors + warnings, descending)
        const totalA = errorsA + warningsA;
        const totalB = errorsB + warningsB;
        if (totalA !== totalB) return totalB - totalA;

        // Sort alphabetically by rule ID
        return ruleA.localeCompare(ruleB);
      }
    )
    .forEach(([ruleId, { errors, warnings, fixable }]) => {
      const errorPart = errors ? `${red(`❌ ${errors}`)}` : '';
      const warningPart = warnings ? `${yellow(`⚠️ ${warnings}`)}` : '';
      const fixableTag = fixable ? green('🛠️') : '';

      console.log(
        `- [ ] ${bold(ruleId)}: ${[errorPart, warningPart]
          .filter(Boolean)
          .join(', ')} ${fixableTag}`
      );
    });

  console.log('\n');
}

import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdirp } from '@rspack/core/dist/util/fs';
import { mkdir } from 'node:fs/promises';

export async function mdRuleSummary(
  summary: RuleSummary,
  file: string = path.join(
    process.cwd(),
    'tools',
    'reports',
    'eslint.report.md'
  )
): Promise<void> {
  let md = '';
  md += '# ESLint Rule Summary\n\n';
  md += '---\n\n';

  md += `- **Fixable Errors:** ${summary.fixableErrors}\n`;
  md += `- **Fixable Warnings:** ${summary.fixableWarnings}\n`;
  md += `- **Total Errors:** ${summary.totalErrors}\n`;
  md += `- **Total Warnings:** ${summary.totalWarnings}\n\n`;

  md += '---\n\n';
  md += '## Rule Details By Effort\n\n';

  Object.entries(summary.ruleCounts)
    .sort(
      (
        [ruleA, { errors: errorsA, warnings: warningsA, fixable: fixableA }],
        [ruleB, { errors: errorsB, warnings: warningsB, fixable: fixableB }]
      ) => {
        // Sort by type (errors before warnings)
        if (errorsA > 0 && warningsA === 0 && errorsB === 0 && warningsB > 0)
          return -1;
        if (errorsB > 0 && warningsB === 0 && errorsA === 0 && warningsA > 0)
          return 1;

        // Sort fixable errors before non-fixable
        if (errorsA > 0 && errorsB > 0) {
          if (fixableA !== fixableB) return fixableB ? -1 : 1;
        }

        // Sort fixable warnings before non-fixable
        if (warningsA > 0 && warningsB > 0) {
          if (fixableA !== fixableB) return fixableB ? -1 : 1;
        }

        // Sort by total number of issues (errors + warnings, descending)
        const totalA = errorsA + warningsA;
        const totalB = errorsB + warningsB;
        if (totalA !== totalB) return totalB - totalA;

        // Sort alphabetically by rule ID
        return ruleA.localeCompare(ruleB);
      }
    )
    .forEach(([ruleId, { errors, warnings, fixable }]) => {
      const errorPart = errors ? `❌ ${errors}` : '';
      const warningPart = warnings ? `⚠️ ${warnings}` : '';
      const fixableTag = fixable ? '🛠️' : '';

      md += `- [ ] **${ruleId}**: ${[errorPart, warningPart]
        .filter(Boolean)
        .join(', ')} ${fixableTag}\n`;
    });

//  await mkdir(path.dirname(file)).catch()
  await writeFile(file, md);
}
