// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  getE2eAppProjectName,
  setupE2eApp,
} from '../../../../testing/utils/src/lib/e2e-setup';
import { join } from 'node:path';

(async () => {
  const fixtureProjectName = 'rsbuild-csr-css';
  const targetProjectName =
    getE2eAppProjectName() ?? 'rsbuild-csr-css-e2e-app-xxx';
  await setupE2eApp({
    fixtureDir: join(__dirname, `../../../fixtures/${fixtureProjectName}`),
    fixtureProjectName,
    targetProjectName,
    targetDir: join(__dirname, `../../../__test__/${targetProjectName}`),
    e2eFixtures: join(__dirname, `../../mock/fixtures/csr-css`),
  }).catch((e) => console.error(e));
})();
