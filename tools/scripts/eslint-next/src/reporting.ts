import { bold, green, red, yellow } from 'ansis';
import { writeFile } from 'fs/promises';
import { RuleSummary, sortByEffort } from './utils';
import { join, extname } from 'node:path';
import prettier from 'prettier';

export function printRuleSummary(summary: RuleSummary): void {
  console.log(bold('ESLint Migration Overview:\n'));

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

  const rules = Object.entries(summary.ruleCounts);
  if (rules.length > 0) {
    console.log(bold('Rule Details By Effort:'));

    rules
      .sort(sortByEffort)
      .forEach(([ruleId, { errors, warnings, fixable }]) => {
        const errorPart = errors ? `${red(`❌ ${errors}`)}` : '';
        const warningPart = warnings ? `${yellow(`⚠️ ${warnings}`)}` : '';
        const fixableTag = fixable ? green('🛠️') : '';

        console.log(
          `- ${bold(ruleId)}: ${[errorPart, warningPart]
            .filter(Boolean)
            .join(', ')} ${fixableTag}`
        );
      });
  } else {
    console.log('No rules violated 🎉');
  }
  console.log('\n');
}

export async function mdRuleSummary(
  summary: RuleSummary,
  file: string = join(process.cwd(), 'tools', 'reports', 'eslint-next.md')
): Promise<void> {
  let md = '';
  md += '# ESLint Rule Summary\n\n';
  md += '---\n\n';

  md += `- **Fixable Errors:** ${summary.fixableErrors}\n`;
  md += `- **Fixable Warnings:** ${summary.fixableWarnings}\n`;
  md += `- **Total Errors:** ${summary.totalErrors}\n`;
  md += `- **Total Warnings:** ${summary.totalWarnings}\n\n`;

  md += '---\n\n';
  const rules = Object.entries(summary.ruleCounts);
  if (rules.length > 0) {
    md += '## Rule Details By Effort\n\n';

    rules
      .sort(sortByEffort)
      .forEach(([ruleId, { errors, warnings, fixable }]) => {
        const errorPart = errors ? `❌ ${errors}` : '';
        const warningPart = warnings ? `⚠️ ${warnings}` : '';
        const fixableTag = fixable ? '🛠️' : '';

        md += `- [x] **${ruleId}**: ${[errorPart, warningPart]
          .filter(Boolean)
          .join(', ')} ${fixableTag}\n`;
      });
  } else {
    md += 'No rules violated 🎉';
  }

  await formatAndWriteFile(file, md);
}

async function formatAndWriteFile(filePath: string, content: string) {
  try {
    // Determine file extension
    const ext = extname(filePath);

    // Map extensions to correct Prettier parser
    const parserMap = {
      '.js': 'babel',
      '.ts': 'typescript',
      '.json': 'json',
      '.md': 'markdown',
      '.html': 'html',
      '.css': 'css',
    };

    const options = (await prettier.resolveConfig(filePath)) || {
      parser: 'babel',
    };

    const formatted = prettier.format(content, {
      options,
      parser: parserMap[ext] || 'babel',
    });

    // Write formatted content to file
    await writeFile(filePath, formatted);
  } catch (error) {
    console.error('Error formatting content:', error);
  }
}
