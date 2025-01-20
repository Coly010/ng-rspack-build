import { RuleViolations } from './utils';

const targetEslintRc = (
  module: 'commonjs' | 'cjs' | 'mjs' | 'module' | 'esm' = 'commonjs'
) =>
  module === 'esm' || module === 'mjs'
    ? `
import nextEslintConfig from './eslint.next.config';

export default [
  ...nextEslintConfig,
  <RULES>
];
` : `
const nextEslintConfig = require('./eslint.next.config');

module.exports = [
  ...nextEslintConfig,
  <RULES>
];
`;

const DEFAULT_INDENT_LEVEL = 6;

export function formatRules(
  rules: Record<string, RuleViolations>,
  {
    indentLevel = DEFAULT_INDENT_LEVEL,
    type = 'error'
  }: {
    indentLevel?: number;
    type?: 'error' | 'warning';
  } = {}
): string[] {
  const icons = { error: '❌', warning: '⚠️' };

  return Array.from(Object.entries(rules))
    .sort(([ruleA, [countA, fixableA]], [ruleB, [countB, fixableB]]) => {
      // Sort by fixable (fixable first)
      if (fixableA !== fixableB) return fixableB ? 1 : -1;
      // Sort by number of issues (descending)
      if (countB !== countA) return countB - countA;
      // Sort alphabetically by rule ID
      return ruleA.localeCompare(ruleB);
    })
    .map(
      ([ruleId, [count, isFixable]]) =>
        `${' '.repeat(indentLevel)}"${ruleId}": "off", // ${
          icons[type]
        } ${count} ${type}${count > 1 ? 's' : ''}${isFixable ? ' 🛠️' : ''}`
    );
}

export function getFile(
  ruleDefinitions: {
    files: string[];
    errors: Record<string, RuleViolations>;
    warnings: Record<string, RuleViolations>;
  }[],
  {
    module = 'commonjs',
    indentLevel = DEFAULT_INDENT_LEVEL
  }: { module: 'commonjs' | 'module' | 'cjs' | 'mjs', indentLevel: number }
): string {
  const configTemplate = targetEslintRc(module);
  const intent = ' '.repeat(indentLevel);
  const formattedRules = ruleDefinitions.filter(
    ({ errors, warnings }) =>
      Object.values(errors).length > 0 || Object.values(warnings).length > 0
  )
    .map(({ files, errors, warnings }) => {
      const warningLines = formatRules(warnings, { type: 'warning' });
      const errorLines = formatRules(errors);
      const errorRules = `\n${intent}// ❌ Errors: ${errorLines.length}\n${errorLines.join('\n')}`;
      const warningRules = `\n${intent}// ⚠️ Warnings: ${warningLines.length}\n${warningLines.join('\n')}`;

      return `{
    files: ${JSON.stringify(files)},
    rules: {${errorLines.length > 0 ? errorRules : ''}${warningLines.length > 0 ? warningRules : ''}
    }
  }`;
    }).join(',\n');

  return configTemplate.replace('<RULES>', formattedRules);
}
