const { JavaScriptTransformer } = require('@angular/build/private');
const { availableParallelism } = require('node:os');
const { normalize } = require('path');

function isPresent(variable) {
  return typeof variable === 'string' && variable !== '';
}

const maxWorkersVariable = process.env['NG_BUILD_MAX_WORKERS'];
const maxWorkers = isPresent(maxWorkersVariable)
  ? +maxWorkersVariable
  : Math.min(4, Math.max(availableParallelism() - 1, 1));

const javascriptTransformer = new JavaScriptTransformer(
  {
    sourcemap: false,
    thirdPartySourcemaps: false,
    advancedOptimizations: false,
    jit: false,
  },
  maxWorkers
);

module.exports = function loader(content) {
  const callback = this.async();

  const request = this.resourcePath;
  const normalizedRequest = normalize(request);
  if (
    request.startsWith('data:text/javascript') &&
    request.includes('__module_federation_bundler_runtime__')
  ) {
    callback(null, content);
    return;
  }
  javascriptTransformer
    .transformData(request, content, false, false)
    .then((contents) => {
      callback(null, Buffer.from(contents));
    });
};
