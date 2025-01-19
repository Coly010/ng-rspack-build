import { RuleViolations } from './utils';

const targetEslintRc = (
  module: 'commonjs' | 'cjs' | 'mjs' | 'module' | 'esm' = 'commonjs'
) =>
  module === 'esm' || module === 'mjs'
    ? `
import nextEslintConfig from './eslint.next.config';

export default [
  ...nextEslintConfig,
/* <RULES> */
];
`
    : `
const nextEslintConfig = require('./eslint.next.config');

module.exports = [
  ...nextEslintConfig,
/* <RULES> */
];
`;

export function formatRules(
  rules: Record<string, RuleViolations>,
  {
    indentLevel = 6,
    type = 'error',
  }: {
    indentLevel?: number;
    type?: 'error' | 'warning';
  } = {}
): string {
  const icons = { error: '❌', warning: '⚠️' };

  return Array.from(Object.entries(rules))
    .sort(([a], [b]) => a.localeCompare(b)) // Sort rules alphabetically
    .map(
      ([ruleId, [count, isFixable]]) =>
        `${' '.repeat(indentLevel)}"${ruleId}": "off", // ${
          icons[type]
        } ${count} ${type}${count > 1 ? 's' : ''}${isFixable ? ' 🛠️' : ''}`
    )
    .join('\n');
}

export function getFile(
  ruleDefinitions: {
    files: string[];
    rules: Record<string, RuleViolations>;
  }[],
  { module = 'commonjs' }: { module: 'commonjs' | 'module' | 'cjs' | 'mjs' }
): string {
  const configTemplate = targetEslintRc(module);

  const formattedRules = ruleDefinitions.filter(
    ({ rules }) => Object.values(rules).length > 0
  );
  console.log(':::::: ', formattedRules);
  const formattedRuless = formattedRules
    .map(({ files, rules }) => {
      const formatted = formatRules(rules);
      return `  {
        files: ${JSON.stringify(files)},
        rules: {
${formatted}
        }
      }`;
    })
    .join(',\n');

  return configTemplate.replace('/* <RULES> */', formattedRuless);
}
