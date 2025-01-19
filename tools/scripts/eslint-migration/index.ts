import { collectRuleViolations, parseExistingConfig } from './utils/utils';
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
  await Promise.all(
    projects.map(async (project, index) => {
      console.log(
        cyan(
          `[${index + 1}/${projects.length}] Processing project: ${
            project.name
          }`
        )
      );

      const eslintConfig = getEslintConfigPath(project);

      try {
        const lintResult = await lintProject(project, eslintConfig);

        if (lintResult === 'skipped') {
          console.log(yellow(`  • Rules are already disabled. Skipping.\n`));
        } else if (lintResult === 'updated') {
          console.log(green(`  ✔ Rules updated successfully.\n`));
        } else {
          console.log(
            red(
              `  ✘ An error occurred while processing project ${project.name}.\n`
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

export const lintProject = async (
  project: any,
  eslintConfig: string
): Promise<'skipped' | 'updated' | 'error'> => {
  try {
    const nextConfigPath = `${project.root}/eslint.next.config.js`;
    const { general: existingGeneral, test: existingTest } =
      await parseExistingConfig(eslintConfig);

    if (existingGeneral.size > 0 || existingTest.size > 0) {
      return 'skipped';
    }

    const eslint = new ESLint({
      overrideConfigFile: eslintConfig,
      errorOnUnmatchedPattern: false,
    });

    const results = await eslint.lintFiles(
      project.targets.lint.options.lintFilePatterns ?? project.root
    );

    const { failingRules, warningRules, testFailingRules, testWarningRules } =
      collectRuleViolations(results, TEST_FILE_PATTERNS);

    // If there are no rule violations, we don't need to update the config.
    const totalViolations = Object.values(collectRuleViolations)
      .map(([count]) => count) // Extract the first element (number of violations)
      .reduce((acc, curr) => acc + curr, 0); // Sum up all violations

    if (totalViolations === 0) {
      if (existsSync(nextConfigPath)) {
        await copyFile(nextConfigPath, eslintConfig); // Restore the original config
        await rm(nextConfigPath); // Remove the temporary next config
      }
      console.log(
        green(`  ✔ Project "${project.name}" has no ESLint errors remaining.\n`)
      );
      return 'skipped';
    }

    const content = getFile(
      [
        {
          files: ['**/*'],
          rules: {
            ...Object.fromEntries(failingRules),
            ...Object.fromEntries(warningRules),
          },
        },
        {
          files: TEST_FILE_PATTERNS,
          rules: {
            ...Object.fromEntries(testFailingRules),
            ...Object.fromEntries(testWarningRules),
          },
        },
      ],
      { module: 'commonjs' }
    );

    if (!existsSync(nextConfigPath)) {
      await copyFile(eslintConfig, nextConfigPath);
    }

    await writeFile(eslintConfig, content.trim());
    return 'updated';
  } catch (error) {
    console.error(`Error processing project: ${project.name}`, error);
    return 'error';
  }
};
