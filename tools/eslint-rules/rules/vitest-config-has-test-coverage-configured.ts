import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import {
  isVitestConfigObject,
  propHasObjectExpression,
  visitObjectExpression,
} from '../utils/utils';
import { getReportsDirectory } from '../utils/vitest';
import { RuleFixer } from '@typescript-eslint/utils/ts-eslint';

export const RULE_NAME = 'vitest-config-has-test-coverage-configured';
const messages = {
  missingCoverageConfig:
    'The `test.coverage` property is missing or incomplete in vite config. Please configure it.',
  missingCoverageReportsDirectory:
    'The `test.coverage.reportsDirectory` property is missing. Please configure it.',
  missingCoverageReporter:
    'The `test.coverage.reporter` property is missing. Please configure it.',
  missingCoverageReporterType:
    'The `test.coverage.reporter` property is missing the "lcov" type. Please configure it.',
} as const;
type messagesIds = keyof typeof messages;
type Options = {
  reporter: string[];
  reportsDirectory: string;
}[];

export const rule: ESLintUtils.RuleModule<messagesIds, Options> =
  ESLintUtils.RuleCreator(() => __filename)({
    name: RULE_NAME,
    meta: {
      type: 'problem',
      docs: {
        description:
          'Ensures `coverage` is properly configured inside `test` in Vitest config files.',
      },
      fixable: 'code',
      schema: [],
      messages,
    },
    defaultOptions: [
      {
        reporter: ['text', 'lcov'],
        reportsDirectory: '../../coverage/nx-plugin/integration-tests',
      },
    ],
    create(context) {
      return {
        CallExpression(node: TSESTree.CallExpression) {
          if (isVitestConfigObject(node)) {
            const configObject = node.arguments[0] as TSESTree.ObjectExpression;

            const testProperty = visitObjectExpression(
              configObject,
              'test',
              propHasObjectExpression
            );
            if (!testProperty) {
              return;
            }
            const testObject = testProperty.value as TSESTree.ObjectExpression;
            const coverageProperty = visitObjectExpression(
              testObject,
              'coverage',
              propHasObjectExpression
            );

            const requiredCoverageConfig = getCoverageConfig(
              context.filename,
              context.options.at(0)
            );

            if (!coverageProperty) {
              // Insert full `coverage` property if missing
              const coverageText = `coverage: ${JSON.stringify(
                requiredCoverageConfig,
                null,
                2
              )}`;
              context.report({
                node: testProperty,
                messageId: 'missingCoverageConfig',
                fix: (fixer: RuleFixer) => {
                  if (testObject.properties.length > 0) {
                    return fixer.insertTextBefore(
                      testObject.properties.at(0) as TSESTree.Property,
                      `${coverageText},\n`
                    );
                  } else {
                    return fixer.insertTextAfter(
                      testProperty.value,
                      `${coverageText}`
                    );
                  }
                },
              });
            } else {
              // Ensure all required `coverage` properties exist
              const coverageObject =
                coverageProperty.value as TSESTree.ObjectExpression;
              const existingProps = new Map(
                coverageObject.properties.map((p) => [
                  (p as TSESTree.Property).key.name,
                  p,
                ])
              );

              if (!existingProps.has('reportsDirectory')) {
                context.report({
                  node: coverageProperty,
                  messageId: 'missingCoverageReportsDirectory',
                  fix: (fixer: RuleFixer) =>
                    fixer.insertTextAfter(
                      coverageObject.properties.at(-1) ??
                        coverageProperty.value,
                      `, reportsDirectory: ${JSON.stringify(
                        requiredCoverageConfig.reportsDirectory
                      )}`
                    ),
                });
              }

              if (!existingProps.has('reporter')) {
                context.report({
                  node: coverageProperty,
                  messageId: 'missingCoverageReporter',
                  fix: (fixer: RuleFixer) =>
                    fixer.insertTextAfter(
                      coverageObject.properties.at(-1) ??
                        coverageProperty.value,
                      `, reporter: ${JSON.stringify(
                        requiredCoverageConfig.reporter
                      )}`
                    ),
                });
              } else {
                // Ensure `lcov` is in `reporter`
                const reporterProp = existingProps.get('reporter');
                if (
                  reporterProp &&
                  reporterProp.value.type === 'ArrayExpression'
                ) {
                  const elements = reporterProp.value.elements.map(
                    (el) => (el as TSESTree.Literal).value
                  );
                  if (!elements.includes('lcov')) {
                    context.report({
                      node: reporterProp,
                      messageId: 'missingCoverageReporterType',
                      fix: (fixer: RuleFixer) =>
                        fixer.insertTextAfter(
                          reporterProp.value.elements.at(
                            -1
                          ) as TSESTree.Property,
                          `, "lcov"`
                        ),
                    });
                  }
                }
              }
            }
          }
        },
      };
    },
  });

function getCoverageConfig(filename: string, options?: Options[number]) {
  const userConfig = options || ({} as Options[number]);
  return {
    provider: 'v8',
    exclude: ['mocks/**', '**/types.ts', '**/__snapshots__/**'],
    reporter: Array.isArray(userConfig.reporter)
      ? [...new Set([...userConfig.reporter, 'lcov'])] // Ensure `lcov` is included
      : ['text', 'lcov'],
    reportsDirectory:
      userConfig.reportsDirectory || getReportsDirectory(filename),
  };
}
