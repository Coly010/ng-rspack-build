import { ESLint } from 'eslint';
import { minimatch } from 'minimatch';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'url';
import { join } from 'path';
import { TEST_FILE_PATTERNS } from '../index';
import { ProjectConfiguration } from 'nx/src/config/workspace-json-project-json';

type ConfigEntry = {
  files: string[];
  rules?: Record<string, string>;
};

export const parseExistingConfig = async (
  configPath: string,
  testFilePatterns = TEST_FILE_PATTERNS
): Promise<{ general: Set<string>; test: Set<string> }> => {
  if (!existsSync(configPath)) return { general: new Set(), test: new Set() };

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
