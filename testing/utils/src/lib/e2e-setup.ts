import path from 'node:path';
import fs from 'node:fs/promises';

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
  const fixture = path.join(
    __dirname,
    `../../../e2e/fixtures/${fixtureProjectName}`
  );
  const target = path.join(__dirname, `../../../e2e/__test__/${targetProjectName}`);
  try {
    await fs.stat(fixture);
  } catch (e) {
    console.warn(
      `Fixture folder not found. Did you change the file or move it? Error: ${
        (e as Error).message
      }`
    );
    return;
  }

  // copy fixtures folder
  await fs.rm(target, { recursive: true, force: true });
  await fs.cp(fixture, target, {
    recursive: true,
    force: true,
    filter(source: string, _: string): boolean | Promise<boolean> {
      return !source.includes('node_modules') && !source.includes('dist');
    },
  });

  // adjust package.json#nx to new location and rename project
  const packageJson = (
    await fs.readFile(path.join(target, 'package.json'), 'utf-8')
  ).toString();
  await fs.writeFile(
    path.join(target, 'package.json'),
    packageJson
      .replaceAll('fixtures', '__test__')
      .replaceAll(fixtureProjectName, targetProjectName)
  );
  // add e2e fixtures
  if (e2eFixtures) {
    await fs.cp(e2eFixtures, target, {
      recursive: true,
      force: true,
    });
  }
}
