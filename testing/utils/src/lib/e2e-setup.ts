import { join } from 'node:path';
import { cp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import * as console from 'node:console';

export function getE2eAppProjectName(): string | undefined {
  const e2eProjectName = process.env['NX_TASK_TARGET_PROJECT'];
  if (e2eProjectName == null) {
    console.warn('NX_TASK_TARGET_PROJECT is not set.');
  }
  return e2eProjectName ? `${e2eProjectName}-e2e-app` : undefined;
}

export async function setupE2eApp({
  fixtureDir,
  targetDir,
  fixtureProjectName,
  targetProjectName,
  e2eFixtures,
}: {
  fixtureProjectName: string;
  fixtureDir: string;
  targetProjectName: string;
  targetDir?: string;
  e2eFixtures?: string;
}) {
  const targetProject = targetProjectName;

  const target = targetDir ?? join(`tmp/e2e/${targetProject}`);
  try {
    await stat(fixtureDir);
  } catch (e) {
    console.warn(
      `Fixture folder not found. Did you change the file or move it? Error: ${(
        e as Error
      ).message.toString()}`
    );
    return;
  }

  // copy fixtures folder
  await rm(target, { recursive: true, force: true });
  await cp(fixtureDir, target, {
    recursive: true,
    force: true,
    filter(source: string): boolean | Promise<boolean> {
      return !source.includes('node_modules') && !source.includes('dist');
    },
  });

  // adjust package.json#nx to new location and rename project
  const packageJson = (
    await readFile(join(target, 'package.json'), 'utf-8')
  ).toString();
  await writeFile(
    join(target, 'package.json'),
    packageJson
      .replaceAll('fixtures', '__test__')
      .replaceAll(fixtureProjectName, targetProject)
  );
  // add e2e fixtures
  if (e2eFixtures) {
    await cp(e2eFixtures, target, {
      recursive: true,
      force: true,
    });
  }
}
