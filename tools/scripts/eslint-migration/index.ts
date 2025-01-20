import {
  aggregateRuleSummary,
  collectRuleViolations, mergeRuleSummaries,
  parseExistingConfig, printRuleSummary,
  RuleCollection,
  RulesCollectionResult, RuleSummary
} from './utils/utils';
import { cyan, green, red, yellow } from 'ansis';
import { ESLint } from 'eslint';
import { getFile } from './utils/file-creation';
import { existsSync } from 'node:fs';
import { copyFile, writeFile, rm } from 'node:fs/promises';
import { getEslintConfigPath } from './utils/nx';

/**
 * Lints all projects.
 * @param projects List of Nx projects to lint.
 */
export const lintAllProjects = async (projects: any[]) => {
  let allResults: RuleSummary;
  await Promise.all(
    projects.map(async (project, index) => {
      const eslintConfig = getEslintConfigPath(project);

      try {
        const result = await lintProject(project, eslintConfig);

        console.log(
          cyan(
            `[${index + 1}/${projects.length}] Processing project: ${
              project.name
            }`
          )
        );

        if(result.status !== 'error') {
          allResults = mergeRuleSummaries(allResults, aggregateRuleSummary(result.data));
        }

        switch (result.status) {
          case 'skipped':
            console.log(yellow(`  • Rules are already disabled. Skipping.\n`));
            break;
          case 'updated':
            console.log(green(`  ✔ Rules updated successfully.\n`));
            break;
          case 'valid':
            console.log(green(`  ✔ Rules passing. Ready for migration.\n`));
            break;
          case 'error':
            console.log(
              red(
                `  ✘ Error for project ${project.name}.\n${result.error}`
              )
            );
            break;
          default:
            console.log(
              red(
                `  ✘ Unknown status ${result.status} for project ${project.name}.\n`
              )
            );
        }
      } catch (error) {
        console.error(
          red(`  ✘ Failed to process project "${project.name}":`),
          error
        );
      }
    })
  );

  printRuleSummary(allResults);
};

export const TEST_FILE_PATTERNS = [
  '*.spec.ts',
  '*.test.ts',
  '**/test/**/*',
  '**/mock/**/*',
  '**/mocks/**/*',
  '*.cy.ts',
  '*.stories.ts',
];

type LintResultSuccess = {status: 'skipped' | 'updated'| 'valid', data: RulesCollectionResult};
type LintResultError = {status: 'error', data: RulesCollectionResult};
type LintResult = LintResultError | LintResultSuccess;

export const lintProject = async (
  project: any,
  eslintConfig: string
): Promise<LintResult> => {
  try {
    const nextConfigPath = `${project.root}/eslint.next.config.js`;

    const eslint = new ESLint({
      overrideConfigFile: eslintConfig,
      errorOnUnmatchedPattern: false,
    });

    const results = await eslint.lintFiles(
      project.targets.lint.options.lintFilePatterns ?? project.root
    );

    let result: RulesCollectionResult;
    try {
      result = collectRuleViolations(results, TEST_FILE_PATTERNS);
    } catch (error) {
      console.error(`Error collecting lint violations: ${project.name}`, error);
    }
    const { failingRules, warningRules, testFailingRules, testWarningRules } =
      result;

    const totalViolations = Object.values(result)
      .flatMap((map) => Object.values(Object.fromEntries(map)))
      .map(([count]) => count)
      .reduce<number>((acc, curr) => acc + curr, 0); // Sum up all violations

    // If there are no rule violations, we don't need to update the config.
    if (totalViolations === 0) {
      if (existsSync(nextConfigPath)) {
        await copyFile(nextConfigPath, eslintConfig); // Restore the original config
        await rm(nextConfigPath); // Remove the temporary next config
      }
      console.log(
        green(`  ✔ Project "${project.name}" has no ESLint errors remaining.\n`)
      );
      return {status: 'skipped', data: result};
    }

    const content = getFile(
      [
        {
          files: ['**/*'],
          errors: Object.fromEntries(failingRules),
          warnings: Object.fromEntries(warningRules),
        },
        {
          files: TEST_FILE_PATTERNS,
          errors: Object.fromEntries(testFailingRules),
          warnings: Object.fromEntries(testWarningRules),
        },
      ],
      { module: 'commonjs' }
    );

    if (!existsSync(nextConfigPath)) {
      await copyFile(eslintConfig, nextConfigPath);
    }
    await writeFile(eslintConfig, content.trim());
    return {status: 'updated', data: result};
  } catch (error) {
    console.error(`Error processing project: ${project.name}`, error);
    return {status: 'error', data: {}, error};
  }
};
