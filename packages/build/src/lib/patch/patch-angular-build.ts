import { readFileSync, writeFileSync } from 'fs';

function main() {
  const angularBuildPackageJson = require.resolve(
    '@angular/build/package.json'
  );
  const fileContentsJson = JSON.parse(
    readFileSync(angularBuildPackageJson, 'utf8')
  );
  fileContentsJson.exports['./src/tools/esbuild/javascript-transformer'] =
    './src/tools/esbuild/javascript-transformer.js';
  fileContentsJson.exports[
    './src/tools/esbuild/angular/file-reference-tracker'
  ] = './src/tools/esbuild/angular/file-reference-tracker.js';
  fileContentsJson.exports[
    './src/tools/angular/compilation/parallel-compilation'
  ] = './src/tools/angular/compilation/parallel-compilation.js';

  writeFileSync(
    angularBuildPackageJson,
    JSON.stringify(fileContentsJson, null, 2)
  );
}

main();
