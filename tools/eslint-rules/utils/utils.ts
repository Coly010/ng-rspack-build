import { TSESTree } from '@typescript-eslint/utils';
import { join, relative } from 'node:path';
import * as process from 'node:process';

/**
 * Walks through an object expression to find the target property.
 */
export function visitObjectExpression(
  node: TSESTree.ObjectExpression,
  propertyName: string,
  filter: (prop: TSESTree.Property) => boolean = () => true
): TSESTree.Property | undefined {
  return node.properties.find(
    (prop) =>
      prop.type === 'Property' &&
      prop.key.type === 'Identifier' &&
      prop.key.name === propertyName &&
      filter(prop)
  ) as TSESTree.Property | undefined;
}

export function propHasObjectExpression(prop: TSESTree.Property) {
  return prop.value.type === 'ObjectExpression';
}

export function isVitestConfigObject(node: TSESTree.Node) {
  const obj = node as TSESTree.CallExpression;
  return (
    obj.callee.type === 'Identifier' &&
    obj.callee.name === 'defineConfig' &&
    obj.arguments.length > 0 &&
    obj.arguments[0].type === 'ObjectExpression'
  );
}

export function getCacheDirFolder(): string {
  const project = process.env['NX_TASK_TARGET_PROJECT'];
  const nxWorkspaceRoot = process.env['NX_WORKSPACE_ROOT'] || process.cwd();
  const vitestCacheDir = join(
    relative(process.env['PWD'] ?? process.cwd(), nxWorkspaceRoot),
    'node_modules/.vite/test',
    project ?? ''
  );
  return vitestCacheDir;
}

