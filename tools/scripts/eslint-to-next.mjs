import {
  createProjectGraphAsync,
  readProjectsConfigurationFromProjectGraph,
} from '@nx/devkit';
import { ESLint } from 'eslint';
import { minimatch } from 'minimatch';
import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'url';

const TEST_FILE_PATTERNS = [
  '*.spec.ts',
  '*.test.ts',
  '**/test/**/*',
  '**/mock/**/*',
  '**/mocks/**/*',
  '*.cy.ts',
  '*.stories.ts',
];

const parseExistingConfig = async (configPath) => {
  if (!existsSync(configPath)) return { general: new Set(), test: new Set() };

  const configUrl = pathToFileURL(configPath);
  const config = (await import(configUrl)).default;

  const generalRules = new Set();
  const testRules = new Set();

  config.forEach((entry) => {
    if (!entry.files || !Array.isArray(entry.files)) return; // Skip if files is undefined or not an array
    if (entry.files.includes('**/*')) {
      Object.keys(entry.rules || {}).forEach((ruleId) => generalRules.add(ruleId));
    } else if (TEST_FILE_PATTERNS.some((pattern) => entry.files.includes(pattern))) {
      Object.keys(entry.rules || {}).forEach((ruleId) => testRules.add(ruleId));
    }
  });

  return { general: generalRules, test: testRules };
};

const graph = await createProjectGraphAsync({ exitOnError: true });
const projects = Object.values(
  readProjectsConfigurationFromProjectGraph(graph).projects
)
  .filter((project) => 'lint' in (project.targets ?? {}))
  .sort((a, b) => a.root.localeCompare(b.root));

for (let i = 0; i < projects.length; i++) {
  const project = projects[i];

  const options = project.targets.lint.options;
  const eslintConfig = options.eslintConfig ?? `${project.root}/eslint.config.js`;
  const patterns = options.lintFilePatterns ?? project.root;

  console.info(
    `Processing Nx ${project.projectType ?? 'project'} "${project.name}" (${
      i + 1
    }/${projects.length}) ...`
  );

  if (!existsSync(eslintConfig)) {
    console.error(`ERROR: ${eslintConfig} does not exist but lint target is defined in project ${project.name}.`);
    continue;
  }

  const { general: existingGeneral, test: existingTest } = await parseExistingConfig(eslintConfig);

  if (existingGeneral.size > 0 || existingTest.size > 0) {
    console.info(`• Rules are already disabled for project "${project.name}". Skipping updates.`);
    continue;
  }

  const eslint = new ESLint({
    overrideConfigFile: eslintConfig,
    errorOnUnmatchedPattern: false,
  });

  const results = await eslint.lintFiles(patterns);

  const failingRules = new Set();
  const warningRules = new Set();
  const testFailingRules = new Set();
  const testWarningRules = new Set();

  for (const result of results) {
    const isTestFile = TEST_FILE_PATTERNS.some((pattern) =>
      minimatch(result.filePath, pattern)
    );
    for (const { ruleId, severity } of result.messages) {
      if (!ruleId) continue; // Skip issues without a ruleId

      if (isTestFile) {
        if (severity === 1) {
          testWarningRules.add(ruleId);
        } else if (severity === 2) {
          testFailingRules.add(ruleId);
        }
      } else {
        if (severity === 1) {
          warningRules.add(ruleId);
        } else if (severity === 2) {
          failingRules.add(ruleId);
        }
      }
    }
  }

  const formatRules = (rules, indentLevel = 6) =>
    Array.from(rules.values())
      .sort((a, b) => a.localeCompare(b))
      .map(
        (ruleId, i, arr) =>
          ' '.repeat(indentLevel) +
          `"${ruleId}": "off"${i === arr.length - 1 ? '' : ','}`
      )
      .join('\n');

  const nextConfigPath = `${project.root}/eslint.next.config.js`;
  if (!existsSync(nextConfigPath)) {
    await fs.copyFile(eslintConfig, nextConfigPath);
    console.info(`• Copied ${eslintConfig} to ${nextConfigPath}`);
  }

  const flatConfig = `
const nextEslintConfig = require('./eslint.next.config');

module.exports = [
  ...nextEslintConfig,
  {
    files: ["**/*"], // General rules for all files
    rules: {
${formatRules(failingRules)}
${formatRules(warningRules)}
    }
  }${
    testFailingRules.size > 0 || testWarningRules.size > 0
      ? `,
  {
    files: ${JSON.stringify(TEST_FILE_PATTERNS)}, // Test file-specific rules
    rules: {
${formatRules(testFailingRules, 6)}
${formatRules(testWarningRules, 6)}
    }
  }`
      : ''
  }
];
`;

  await fs.writeFile(eslintConfig, flatConfig.trim());
  console.info(
    `• Updated ${eslintConfig} to use flat config and disable failing and warning rules for the first time\n`
  );
}

process.exit(0);
