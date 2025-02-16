import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import { isVitestConfigObject, visitObjectExpression } from '../utils/utils';
import { join } from 'node:path';
import { getVitestCacheDirFolder } from '../utils/vitest';

export const RULE_NAME = 'vitest-config-has-unique-cachedir-configured';

const seenCacheDirs = new Set<string>();

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensures `cacheDir` is configured and unique across in Vitest config files.',
    },
    fixable: 'code',
    schema: [
      {
        type: 'string',
      },
    ],
    messages: {
      missingCacheDirConfig:
        'The `cacheDir` property is missing in vite config. Please configure it.',
      duplicateCacheDirConfig:
        'The `cacheDir` property is not unique across vite config files.',
    },
  },
  defaultOptions: [
    'node_modules/.vite',
],
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (isVitestConfigObject(node)) {
          const configObject = node.arguments[0] as TSESTree.ObjectExpression;
          const cacheDirText = join(context.options.at(0) || getVitestCacheDirFolder(context.filename));

          // Find `cacheDir` property inside the root config
          const cacheDirProperty = visitObjectExpression(
            configObject,
            'cacheDir'
          );

          // Check if `cacheDir` property is missing
          if (!cacheDirProperty || cacheDirProperty.value.type !== 'Literal') {
            // Report missing `cacheDir`
            context.report({
              node: configObject,
              messageId: 'missingCacheDirConfig',
              fix(fixer) {

                return addCacheDir(cacheDirText, configObject, fixer);
              },
            });
          }
          // Check if `cacheDir` property is set
          else if (
            cacheDirProperty.value.type === 'Literal' &&
            typeof cacheDirProperty.value.value === 'string'
          ) {
            const cacheDirValue = cacheDirProperty.value.value;

            // Check if `cacheDir` value is already used
            if (seenCacheDirs.has(cacheDirValue)) {
              context.report({
                node: cacheDirProperty,
                messageId: 'duplicateCacheDirConfig',
              });
            } else {
              seenCacheDirs.add(cacheDirValue);
            }
          }
        }
      },
    };
  },
});

function addCacheDir(
  cacheDirValue: string,
  configObject: TSESTree.ObjectExpression,
  fixer: TSESTree.RuleFixer
) {
  const cacheDirContent = `cacheDir: '${cacheDirValue}'`;
  if (configObject.properties.length > 0) {
    // Insert after last property inside root config
    const firstProperty = configObject.properties.at(0);
    if (firstProperty) {
      return fixer.insertTextBefore(firstProperty, `${cacheDirContent}, `);
    }
  } else {
    // If config is empty, insert the first property
    return fixer.insertTextAfter(configObject, `${cacheDirContent}`);
  }
}
