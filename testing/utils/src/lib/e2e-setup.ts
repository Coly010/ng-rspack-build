import * as console from 'node:console';
import { join } from 'node:path';
import { cp, readFile, rm, stat, writeFile } from 'node:fs/promises';

export function getE2eAppProjectName(): string | undefined {
  const e2eProjectName = process.env['NX_TASK_TARGET_PROJECT'] ?? '';
  if (e2eProjectName == null) {
    console.warn('NX_TASK_TARGET_PROJECT is not set.');
  }
  return e2eProjectName ? `${e2eProjectName}-app` : undefined;
}

export async function setupE2eApp(
  fixtureProjectName: string,
  e2eFixtures?: string
) {
  const targetProjectName =
    getE2eAppProjectName() ?? fixtureProjectName + '-e2e-app';
  const fixture = join(
    __dirname,
    `../../../e2e/fixtures/${fixtureProjectName}`
  );
  const target = join(__dirname, `../../../e2e/__test__/${targetProjectName}`);
  try {
    await stat(fixture);
  } catch (e) {
    console.warn(
      `Fixture folder not found. Did you change the file or move it? Error: ${
        (e as Error).message
      }`
    );
    return;
  }

  // copy fixtures folder
  await rm(target, { recursive: true, force: true });
  await cp(fixture, target, {
    recursive: true,
    force: true,
    filter(source: string, _: string): boolean | Promise<boolean> {
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
      .replaceAll(fixtureProjectName, targetProjectName)
  );
  // add e2e fixtures
  if (e2eFixtures) {
    await cp(e2eFixtures, target, {
      recursive: true,
      force: true,
    });
  }
}
