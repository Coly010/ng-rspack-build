import {
  getE2eAppProjectName,
  setupE2eApp,
} from '../../../../testing/utils/src/lib/e2e-setup';
import { join } from 'node:path';

(async () => {
  const fixtureProjectName = 'e2e-fixture-base';
  const targetProjectName = getE2eAppProjectName();
  await setupE2eApp({
    fixtureDir: join(__dirname, `../../../fixtures/${fixtureProjectName}`),
    fixtureProjectName,
    targetProjectName,
    targetDir: join(__dirname, `../../../__test__/${targetProjectName}`),
    e2eFixtures: join(__dirname, `../../mock/fixtures/csr-scss`),
  }).catch((e) => console.error(e));
})();
