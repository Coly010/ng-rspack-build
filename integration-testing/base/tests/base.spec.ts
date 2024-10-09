import { afterAll, beforeAll, describe, test, expect } from 'vitest';
import {
  cleanup,
  createTestProject,
  killPort,
  runCommand,
  runCommandUntil,
} from '@ng-rspack/integration/utils';
import { uniq } from '@nx/plugin/testing';

describe('Base Functionality', () => {
  beforeAll(() => {
    createTestProject();
  });

  afterAll(() => {
    cleanup();
  });

  describe.each(['css', 'scss', 'sass'])(
    'Generated Application - %s',
    (style) => {
      const projectName = uniq('myapp');

      beforeAll(async () => {
        await runCommand(
          `nx g @ng-rspack/nx:application apps/${projectName} --style=${style} --unitTestRunner=jest --e2eTestRunner=none --no-interactive`
        );
      }, 50_000);

      test('should build', async () => {
        // ACT
        const result = await runCommand(`nx build ${projectName}`);

        // ASSERT
        expect(
          /Successfully ran target build/g.test(result.stdout)
        ).toBeTruthy();
      });

      test('should serve', async () => {
        // ACT
        await runCommandUntil(`nx serve ${projectName}`, (output) => {
          // ASSERT
          return /Rspack.+compiled successfully/g.test(output);
        });
        await killPort(4200);
      }, 25_000);

      test('should run unit tests', async () => {
        // ACT
        const result = await runCommand(`nx test ${projectName}`);

        // ASSERT
        expect(
          /Successfully ran target test/g.test(result.stdout)
        ).toBeTruthy();
      });

      // TODO(@Coly010): Re-enable when linting issues are investigate in @nx/angular
      test.skip('should run linting', async () => {
        // ACT
        const result = await runCommand(`nx lint ${projectName}`);

        // ASSERT
        expect(
          /Successfully ran target lint/g.test(result.stdout)
        ).toBeTruthy();
      });
    }
  );
});
