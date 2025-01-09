const { dirname, resolve, join } = require('path/posix');
const { cpSync } = require('fs');

module.exports = {
  onSuccess: ({ constants }) => {
    console.log('onPostBuild - moving browser assets');
    const browserDistFolder = resolve(constants.PUBLISH_DIR, 'browser');
    const destination = join(dirname(constants.FUNCTIONS_DIST), 'browser');
    console.log(
      'onPostBuild - browserDist, destination',
      browserDistFolder,
      destination
    );
    cpSync(browserDistFolder, destination, {
      recursive: true,
    });
    console.log('onPostBuild - finished moving browser assets');
  },
};
