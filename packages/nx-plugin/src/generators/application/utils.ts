import { relative, resolve } from 'path/posix';

export function makePathRelativeToProjectRoot(
  pathToReplace: string,
  projectRoot: string
) {
  // Resolve paths to absolute to avoid issues with relative paths
  const absoluteBasePath = resolve(projectRoot);
  const absoluteFilePath = resolve(pathToReplace);

  // Get the relative path from basePath to filePath
  const relativePath = relative(absoluteBasePath, absoluteFilePath);

  // If the relative path starts with '..', that means the file is outside the basePath
  if (relativePath.startsWith('..')) {
    // If it's not inside the basePath, return the original path
    return pathToReplace;
  }

  // Prepend './' if the relative path doesn't already start with it
  return `./${relativePath}`;
}
