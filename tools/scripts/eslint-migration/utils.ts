import { ESLint } from 'eslint';
import { minimatch } from 'minimatch';
import { copyFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'url';
import { cyan, green, red, yellow, bold } from 'ansis';
import {
  createProjectGraphAsync,
  readProjectsConfigurationFromProjectGraph,
} from '@nx/devkit';
import { join } from 'path';

const TEST_FILE_PATTERNS = [
  '*.spec.ts',
  '*.test.ts',
  '**/test/**/*',
  '**/mock/**/*',
  '**/mocks/**/*',
  '*.cy.ts',
  '*.stories.ts',
];

type ConfigEntry = {
  files: string[];
  rules?: Record<string, string>;
};

export const parseExistingConfig = async (
  configPath: string
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
      TEST_FILE_PATTERNS.some((pattern) => entry.files.includes(pattern))
    ) {
      Object.keys(entry.rules || {}).forEach((ruleId) => testRules.add(ruleId));
    }
  });

  return { general: generalRules, test: testRules };
};

export const lintProject = async (
  project: any,
  eslintConfig: string
): Promise<'skipped' | 'updated' | 'error'> => {
  try {
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

    const failingRules = new Map<string, number>();
    const warningRules = new Map<string, number>();
    const testFailingRules = new Map<string, number>();
    const testWarningRules = new Map<string, number>();

    results.forEach((result) => {
      const isTestFile = TEST_FILE_PATTERNS.some((pattern) =>
        minimatch(result.filePath, pattern)
      );

      result.messages.forEach(({ ruleId, severity }) => {
        if (!ruleId) return;

        const ruleSet =
          isTestFile && severity === 1
            ? testWarningRules
            : isTestFile
            ? testFailingRules
            : severity === 1
            ? warningRules
            : failingRules;

        ruleSet.set(ruleId, (ruleSet.get(ruleId) || 0) + 1);
      });
    });

    const formatRules = (rules, indentLevel = 6, type:'error' | 'warning' = 'error') => {
      const ruleEntries = Array.from(rules.entries()).sort(([a], [b]) => a.localeCompare(b));
      return ruleEntries
        .map(
          ([ruleId, count], i) =>
            ' '.repeat(indentLevel) +
            `"${ruleId}": "off"${i === ruleEntries.length - 1 ? '' : ','} // ${count} ${
              count === 1 ? type : `${type}s`
            }`
        )
        .join('\n');
    };

    const failingRulesCount = formatRules(failingRules);
    const warningRulesCount = formatRules(warningRules, 6, 'warning');
    const flatConfig = `
const nextEslintConfig = require('./eslint.next.config');

module.exports = [
  ...nextEslintConfig,
  {
    files: ["**/*"],
    rules: {
${failingRulesCount}${failingRulesCount && warningRulesCount ? '\n,\n' : ''}
${warningRulesCount}
    }
  }${
    testFailingRules.size > 0 || testWarningRules.size > 0
      ? `,
  {
    files: ${JSON.stringify(TEST_FILE_PATTERNS)},
    rules: {
${formatRules(testFailingRules)}
${formatRules(testWarningRules)}
    }
  }`
      : ''
  }
];
`;

    const nextConfigPath = `${project.root}/eslint.next.config.js`;
    if (!existsSync(nextConfigPath)) {
      await copyFile(eslintConfig, nextConfigPath);
    }

    await writeFile(eslintConfig, flatConfig.trim());
    return 'updated';
  } catch (error) {
    console.error(`Error processing project: ${project.name}`, error);
    return 'error';
  }
};

export async function getProjectsWithEslintTarget() {
  const graph = await createProjectGraphAsync({ exitOnError: true });
  return Object.values(
    readProjectsConfigurationFromProjectGraph(graph).projects
  )
    .filter((project) => 'lint' in (project.targets ?? {}))
    .filter((project) => {
      const optEslintConfig = project.targets?.lint.options?.eslintConfig;
      const potentialEslintCinfig = [
        ...(optEslintConfig ? [optEslintConfig] : []),
        ...['cjs', 'mjs', 'js'].map((ext) =>
          join(project.root, `eslint.config.${ext}`)
        ),
      ];

      try {
        const hasEslintConfig: boolean = potentialEslintCinfig.some(file => existsSync(file));
        (hasEslintConfig === false &&
          console.log(yellow(`  • 'Skipping project ${bold(project.name)} because it does not have an eslintConfig`)));
        return hasEslintConfig;
      } catch (e) {
        console.log(yellow(`  • 'Skipping project ${bold(project.name)} loading because of eslintConfig error: ${e}`));
        return false;
      }
    })
    .sort((a, b) => a.root.localeCompare(b.root));
}

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

      const eslintConfig =
        project.targets?.lint.options?.eslintConfig ?? [
        ...['cjs', 'mjs', 'js'].map((ext) =>
          join(project.root, `eslint.config.${ext}`)
        ),
      ].find((file) => existsSync(file));

      try {
        const lintResult = await lintProject(project, eslintConfig);

        if (lintResult === 'skipped') {
          console.log(yellow(`  • Rules are already disabled. Skipping.\n`));
        } else if (lintResult === 'updated') {
          console.log(green(`  ✔ Rules updated successfully.\n`));
        } else {
          console.log(
            red(`  ✘ An error occurred while processing the project.\n`)
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
