import { dirname, resolve, join } from 'path/posix';
import { cpSync } from 'fs';

export const onPostBuild = function ({ constants }) {
  console.log('onPostBuild - moving browser assets');
  const browserDistFolder = resolve(constants.PUBLISH_DIR, 'browser');
  const destination = join(dirname(constants.FUNCTIONS_DIST), 'browser');
  console.log(
    'onPostBuild - browserDist, destination',
    borwserDistFolder,
    destination
  );
  cpSync(browserDistFolder, destination, {
    recursive: true,
  });
  console.log('onPostBuild - finished moving browser assets');
};
