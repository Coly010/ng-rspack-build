import { extname } from 'path';
import { Remotes } from '../../../types/module-federation';

/**
 * Map remote names to a format that can be understood and used by Module
 * Federation.
 *
 * @param remotes - The remotes to map
 * @param remoteEntryExt - The file extension of the remoteEntry file
 * @param determineRemoteUrl - The function used to lookup the URL of the served remote
 */
export function mapRemotes(
  remotes: Remotes,
  remoteEntryExt: 'js' | 'mjs',
  determineRemoteUrl: (remote: string) => string
): Record<string, string> {
  const mappedRemotes: Record<string, string> = {};

  for (const nxRemoteProjectName of remotes) {
    if (Array.isArray(nxRemoteProjectName)) {
      const mfRemoteName = normalizeRemoteName(nxRemoteProjectName[0]);
      mappedRemotes[mfRemoteName] = handleArrayRemote(
        nxRemoteProjectName,
        remoteEntryExt
      );
    } else {
      const mfRemoteName = normalizeRemoteName(nxRemoteProjectName);
      mappedRemotes[mfRemoteName] = handleStringRemote(
        nxRemoteProjectName,
        determineRemoteUrl
      );
    }
  }

  return mappedRemotes;
}

// Helper function to deal with remotes that are arrays
function handleArrayRemote(
  remote: [string, string],
  remoteEntryExt: 'js' | 'mjs'
): string {
  const [nxRemoteProjectName, remoteLocation] = remote;
  const mfRemoteName = normalizeRemoteName(nxRemoteProjectName);
  const remoteLocationExt = extname(remoteLocation);

  // If remote location already has .js or .mjs extension
  if (['.js', '.mjs'].includes(remoteLocationExt)) {
    return remoteLocation;
  }

  const baseRemote = remoteLocation.endsWith('/')
    ? remoteLocation.slice(0, -1)
    : remoteLocation;

  const globalPrefix = `${normalizeRemoteName(mfRemoteName)}@`;

  // if the remote is defined with anything other than http then we assume it's a promise based remote
  // In that case we should use what the user provides as the remote location
  if (!remoteLocation.startsWith('promise new Promise')) {
    return `${globalPrefix}${baseRemote}/remoteEntry.${remoteEntryExt}`;
  } else {
    return remoteLocation;
  }
}

// Helper function to deal with remotes that are strings
function handleStringRemote(
  nxRemoteProjectName: string,
  determineRemoteUrl: (nxRemoteProjectName: string) => string
): string {
  return `${determineRemoteUrl(nxRemoteProjectName)}`;
}

/**
 * Map remote names to a format that can be understood and used by Module
 * Federation.
 *
 * @param remotes - The remotes to map
 * @param remoteEntryExt - The file extension of the remoteEntry file
 * @param determineRemoteUrl - The function used to lookup the URL of the served remote
 */
export function mapRemotesForSSR(
  remotes: Remotes,
  remoteEntryExt: 'js' | 'mjs',
  determineRemoteUrl: (remote: string) => string
): Record<string, string> {
  const mappedRemotes: Record<string, string> = {};

  for (const remote of remotes) {
    if (Array.isArray(remote)) {
      const [nxRemoteProjectName, remoteLocation] = remote;
      const mfRemoteName = normalizeRemoteName(nxRemoteProjectName);
      const remoteLocationExt = extname(remoteLocation);
      mappedRemotes[mfRemoteName] = `${mfRemoteName}@${
        ['.js', '.mjs'].includes(remoteLocationExt)
          ? remoteLocation
          : `${
              remoteLocation.endsWith('/')
                ? remoteLocation.slice(0, -1)
                : remoteLocation
            }/remoteEntry.${remoteEntryExt}`
      }`;
    } else {
      const mfRemoteName = normalizeRemoteName(remote);
      mappedRemotes[mfRemoteName] = `${mfRemoteName}@${determineRemoteUrl(
        remote
      )}`;
    }
  }

  return mappedRemotes;
}

function normalizeRemoteName(nxRemoteProjectName: string): string {
  return nxRemoteProjectName.replace(/-/g, '_');
}
