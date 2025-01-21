import {
  aggregateRuleSummary,
  collectRuleViolations,
  mdRuleSummary,
  mergeRuleSummaries,
  printRuleSummary,
  RulesCollectionResult,
  RuleSummary,
} from './src/utils';
import { cyan, green, red, yellow, bold } from 'ansis';
import { ESLint } from 'eslint';
import { getFile } from './src/file-creation';
import { existsSync } from 'node:fs';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { getEslintConfigPath } from './src/nx';
import { ProjectConfiguration } from 'nx/src/config/workspace-json-project-json';
import { dirname } from 'path';

/**
 * Lints all projects.
 * @param projects List of Nx projects to lint.
 */
export const lintAllProjects = async (projects: ProjectConfiguration[]) => {
  let allResults: RuleSummary = {
    fixableErrors: 0,
    fixableWarnings: 0,
    totalErrors: 0,
    totalWarnings: 0,
    ruleCounts: {},
  };
  await Promise.all(
    projects.map(async (project, index) => {
      try {
        const result = await updateEsLintMigrationPlan({
          lintFilePatterns:
            project.targets.lint?.options?.lintFilePatterns ?? project.root,
          name: project.name,
          eslintConfig: getEslintConfigPath(project),
        });

        console.log(
          cyan(
            `[${index + 1}/${projects.length}] Processing project: ${
              project.name
            }`
          )
        );

        if (result.status !== 'error') {
          allResults = mergeRuleSummaries([
            allResults,
            aggregateRuleSummary(result.data),
          ]);
          // console.log(result.data);
        }

        switch (result.status) {
          case 'skipped':
            console.log(
              yellow(
                `  • Project "${project.name}" already has rules disabled. No changes made.\n`
              )
            );
            break;
          case 'updated':
            console.log(
              green(
                `  ✔ Project "${project.name}" has been successfully updated with new rule configurations.\n`
              )
            );
            break;
          case 'valid':
            console.log(
              green(
                `  ✔ Project "${project.name}" has no ESLint violations. All rules are passing.\n`
              )
            );
            break;
          case 'error':
            console.error(
              red(
                `  ✘ An error occurred while processing project "${
                  project.name
                }".\n   Details: ${
                  result.error?.message || 'No additional details available.'
                }\n`
              )
            );
            break;
          default:
            console.error(
              red(
                `  ✘ Unexpected status "${result.status}" encountered for project "${project.name}". This should be reported.\n`
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
  await mdRuleSummary(allResults);
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

type LintResultSuccess = {
  status: 'skipped' | 'updated' | 'valid';
  data: RulesCollectionResult;
};

type LintResultError = { status: 'error'; data: RulesCollectionResult };
type LintResult = LintResultError | LintResultSuccess;

/**
 *  1. Prepare migration:
 *  Does the next file exist in the file system?
 *     - if it does, use it to create the eslintConfig
 *     - else, rename the existing `eslint.config.js` to `eslint.next.config.js`
 *  2. Lint the files with the `eslint.next.config.js` and collect rule violations
 *  Are there new lint results compared to last generation?
 *    - if there are any violations, generate the updated ESLint configuration
 *    - else, return data
 */
export const updateEsLintMigrationPlan = async ({
  name,
  lintFilePatterns,
  eslintConfig,
}: {
  eslintConfig: string;
  name: string;
  lintFilePatterns: string[];
}): Promise<LintResult> => {
  const targetName = bold(name);
  const nextConfigPath = `${dirname(eslintConfig)}/eslint.next.config.js`;
  try {
    // 1. Prepare migration:
    // Does the next file exist in the file system?
    //    - if it does not, rename the existing `eslint.config.js` to `eslint.next.config.js`
    if (!existsSync(nextConfigPath)) {
      await rename(eslintConfig, nextConfigPath);
      console.log(
        green(
          `✔ Created create target config inc. all rules on: "${nextConfigPath}"`
        )
      );
    }

    // 2. Lint the files with the `eslint.next.config.js` and collect rule violations
    //   - if there are any violations, generate the updated ESLint configuration
    //   - else, return data

    console.log(yellow(`🚀 Starting migration plan for target: ${targetName}`));

    // create config
    const eslint = new ESLint({
      overrideConfigFile: nextConfigPath,
      errorOnUnmatchedPattern: false,
    });

    // lint the files
    const results = await eslint.lintFiles(lintFilePatterns);

    console.log(green(`✔ Successfully linted files for target: ${targetName}`));

    // Collect rule violations
    let result: RulesCollectionResult;
    try {
      result = collectRuleViolations(results, TEST_FILE_PATTERNS);
      console.log(
        green(
          `✔ Collected rule violations for project: ${targetName} (${bold(
            `${Object.values(result).flatMap((m) => [...m.keys()]).length}`
          )} total rules)`
        )
      );
    } catch (error) {
      console.error(
        red(
          `❌ Error collecting rule violations for target: ${targetName}\nError: ${error.message}`
        )
      );
      throw error;
    }

    const { failingRules, warningRules, testFailingRules, testWarningRules } =
      result;

    const totalViolations = Object.values(result)
      .flatMap((map) => Object.values(Object.fromEntries(map)))
      .map(([count]) => count)
      .reduce<number>((acc, curr) => acc + curr, 0);

    // Handle no-violations scenario
    if (totalViolations === 0) {
      console.log(green(`✔ No updates for target "${targetName}".`));
      // @TODO if there are no rules configured in the eslint config and next did not find any violations,
      // we should rename the next config no default naming
      return { status: 'valid', data: result };
    }

    // Generate updated ESLint configuration
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

    // Avoid redundant writes
    const existingContent = existsSync(eslintConfig)
      ? await readFile(eslintConfig, 'utf8')
      : '';
    if (existingContent.trim() === content.trim()) {
      console.log(
        green(
          `✔ ESLint config for project "${targetName}" is already up to date.\n`
        )
      );
      return { status: 'skipped', data: result };
    }

    // Write the updated configuration
    await writeFile(eslintConfig, content.trim());
    console.log(
      green(
        `🎉 Migration successful for project "${targetName}". Rules updated!\n`
      )
    );

    return { status: 'updated', data: result };
  } catch (error) {
    console.error(
      red(`❌ Failed to process project "${targetName}" due to an error.\n`)
    );
    console.error(red(`   Error details: ${error.message}`));
    return { status: 'error', data: {}, error };
  }
};
