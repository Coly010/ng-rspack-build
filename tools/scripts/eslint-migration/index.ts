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
import { copyFile, readFile, rm, writeFile } from 'node:fs/promises';
import { getEslintConfigPath } from './src/nx';

/**
 * Lints all projects.
 * @param projects List of Nx projects to lint.
 */
export const lintAllProjects = async (projects: any[]) => {
  let allResults: RuleSummary = {
    fixableErrors: 0,
    fixableWarnings: 0,
    totalErrors: 0,
    totalWarnings: 0,
    ruleCounts: {},
  };
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

        if (result.status !== 'error') {
          allResults = mergeRuleSummaries([
            allResults,
            aggregateRuleSummary(result.data),
          ]);
          // console.log(result.data);
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
              red(`  ✘ Error for project ${project.name}.\n${result.error}`)
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

export const lintProject = async (
  project: any,
  eslintConfig: string
): Promise<LintResult> => {
  const projectName = bold(project.name);
  const nextConfigPath = `${project.root}/eslint.next.config.js`;

  try {
    console.log(
      yellow(`🚀 Starting ESLint migration for project: ${projectName}`)
    );

    const eslint = new ESLint({
      overrideConfigFile: eslintConfig,
      errorOnUnmatchedPattern: false,
    });

    // Lint the files in the project
    const results = await eslint.lintFiles(
      project.targets.lint.options.lintFilePatterns ?? project.root
    );

    console.log(
      green(`✔ Successfully linted files for project: ${projectName}`)
    );

    // Collect rule violations
    let result: RulesCollectionResult;
    try {
      result = collectRuleViolations(results, TEST_FILE_PATTERNS);
      console.log(
        green(
          `✔ Collected rule violations for project: ${projectName} (${bold(
            `${Object.values(result).flatMap((m) => [...m.keys()]).length}`
          )} total rules)`
        )
      );
    } catch (error) {
      console.error(
        red(
          `❌ Error collecting rule violations for project: ${projectName}\nError: ${error.message}`
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
      if (existsSync(nextConfigPath)) {
        await copyFile(nextConfigPath, eslintConfig); // Restore original config
        await rm(nextConfigPath); // Remove temporary config
      }
      console.log(
        green(
          `✔ Project "${projectName}" has no ESLint violations. No updates were necessary.\n`
        )
      );
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

    // Create backup if it doesn't already exist
    if (!existsSync(nextConfigPath)) {
      await copyFile(eslintConfig, nextConfigPath);
      console.log(green(`✔ Created backup config: "${nextConfigPath}"`));
    }

    // Avoid redundant writes
    const existingContent = existsSync(eslintConfig)
      ? await readFile(eslintConfig, 'utf8')
      : '';
    if (existingContent.trim() === content.trim()) {
      console.log(
        green(
          `✔ ESLint config for project "${projectName}" is already up to date.\n`
        )
      );
      return { status: 'skipped', data: result };
    }

    // Write the updated configuration
    await writeFile(eslintConfig, content.trim());
    console.log(
      green(
        `🎉 Migration successful for project "${projectName}". Rules updated!\n`
      )
    );

    return { status: 'updated', data: result };
  } catch (error) {
    console.error(
      red(`❌ Failed to process project "${projectName}" due to an error.\n`)
    );
    console.error(red(`   Error details: ${error.message}`));
    return { status: 'error', data: {}, error };
  }
};
