import { TSESTree } from '@typescript-eslint/utils';
import { basename, join, relative } from 'node:path';
import * as process from 'node:process';

export function isVitestConfigObject(node: TSESTree.Node) {
  const obj = node as TSESTree.CallExpression;
  return (
    obj.callee.type === 'Identifier' &&
    obj.callee.name === 'defineConfig' &&
    obj.arguments.length > 0 &&
    obj.arguments[0].type === 'ObjectExpression'
  );
}

export function getVitestCacheDirFolder(
  configName = 'vitest.config.ts'
): string {
  const targetFolder =
    (
      basename(configName).match(
        /^vitest(?:\.(\w+))?\.config\.(?:c|m)?[jt]s$/
      ) ?? []
    ).at(1) ?? 'test';
  const project = process.env['NX_TASK_TARGET_PROJECT'];
  const nxWorkspaceRoot = process.env['NX_WORKSPACE_ROOT'] || process.cwd();
  const vitestCacheDir = join(
    relative(process.env['PWD'] ?? process.cwd(), nxWorkspaceRoot),
    'node_modules/.vite',
    project ?? '',
    targetFolder
  );
  return vitestCacheDir;
}

export function getReportsDirectory(configName: string) {
  const project = process.env['NX_TASK_TARGET_PROJECT'];
  const nxWorkspaceRoot = process.env['NX_WORKSPACE_ROOT'] || process.cwd();
  const targetFolder =
    (
      basename(configName).match(
        /^vitest(?:\.(\w+))?\.config\.(?:c|m)?[jt]s$/
      ) ?? []
    ).at(1) ?? 'test';
  const reportsDirectory = join(
    relative(process.env['PWD'] ?? process.cwd(), nxWorkspaceRoot),
    'coverage',
    project ?? '',
    targetFolder
  );
  return reportsDirectory;
}
