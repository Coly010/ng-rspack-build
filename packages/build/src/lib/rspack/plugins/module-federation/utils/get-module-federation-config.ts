import {
  MappedRemotes,
  ModuleFederationConfig,
  SharedLibraryConfig,
  SharedWorkspaceLibraryConfig,
  SharedDependencies,
} from '../../../types/module-federation';
import { NormalModuleReplacementPlugin } from '@rspack/core';
import {
  readCachedProjectConfiguration,
  readCachedProjectGraph,
} from 'nx/src/project-graph/project-graph';
import { getDependentPackagesForProject } from './get-dependencies';
import {
  applyAdditionalShared,
  applySharedFunction,
  sharePackages,
  shareWorkspaceLibraries,
} from './share';
import { mapRemotes, mapRemotesForSSR } from './remotes';
import { ProjectConfiguration } from '@nx/devkit';

export type ResolvedModuleFederationConfig = {
  sharedLibraries: SharedWorkspaceLibraryConfig;
  sharedDependencies: SharedDependencies;
  mappedRemotes: MappedRemotes;
};

export function applyDefaultEagerPackages(
  sharedConfig: Record<string, SharedLibraryConfig>
) {
  const DEFAULT_PACKAGES_TO_LOAD_EAGERLY = [
    '@angular/localize',
    '@angular/localize/init',
    '@angular/core',
    '@angular/core/primitives/signals',
    '@angular/core/primitives/event-dispatch',
  ];
  for (const pkg of DEFAULT_PACKAGES_TO_LOAD_EAGERLY) {
    if (!sharedConfig[pkg]) {
      continue;
    }

    sharedConfig[pkg] = { ...sharedConfig[pkg], eager: true };
  }
}

export const DEFAULT_NPM_PACKAGES_TO_AVOID = [
  'zone.js',
  '@nx/angular/mf',
  '@nrwl/angular/mf',
];
export const DEFAULT_ANGULAR_PACKAGES_TO_SHARE = [
  '@angular/core',
  '@angular/animations',
  '@angular/common',
];

export function getFunctionDeterminateRemoteUrl(isServer = false) {
  const target = 'serve';
  const remoteEntry = isServer ? 'server/remoteEntry.js' : 'remoteEntry.js';

  return function (remote: string) {
    const mappedStaticRemotesFromEnv = process.env[
      'NX_MF_DEV_SERVER_STATIC_REMOTES'
    ]
      ? JSON.parse(process.env['NX_MF_DEV_SERVER_STATIC_REMOTES'])
      : undefined;
    if (mappedStaticRemotesFromEnv && mappedStaticRemotesFromEnv[remote]) {
      return `${mappedStaticRemotesFromEnv[remote]}/${remoteEntry}`;
    }

    let remoteConfiguration: ProjectConfiguration | null = null;
    try {
      remoteConfiguration = readCachedProjectConfiguration(remote);
    } catch (e) {
      throw new Error(
        `Cannot find remote "${remote}". Check that the remote name is correct in your module federation config file.\n`
      );
    }
    const serveTarget = remoteConfiguration?.targets?.[target];

    if (!serveTarget) {
      throw new Error(
        `Cannot automatically determine URL of remote (${remote}). Looked for property "host" in the project's "serve" target.\n
      You can also use the tuple syntax in your webpack config to configure your remotes. e.g. \`remotes: [['remote1', 'http://localhost:4201']]\``
      );
    }

    const host =
      serveTarget.options?.host ??
      `http${serveTarget.options.ssl ? 's' : ''}://localhost`;
    const port = serveTarget.options?.port ?? 4201;
    return `${
      host.endsWith('/') ? host.slice(0, -1) : host
    }:${port}/${remoteEntry}`;
  };
}

export function getModuleFederationConfig(
  config: ModuleFederationConfig,
  options: {
    isServer: boolean;
    determineRemoteUrl?: (remote: string) => string;
  } = { isServer: false }
): ResolvedModuleFederationConfig {
  const resolvedConfig: ResolvedModuleFederationConfig = {
    sharedLibraries: {
      getAliases: () => ({}),
      getLibraries: () => ({}),
      getReplacementPlugin: () =>
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        new NormalModuleReplacementPlugin(/./, () => {}),
    },
    sharedDependencies: {},
    mappedRemotes: {},
  };

  if (!global.NX_GRAPH_CREATION) {
    const projectGraph = readCachedProjectGraph();

    if (!projectGraph.nodes[config.name]?.data) {
      throw Error(
        `Cannot find project "${config.name}". Check that the name is correct in module-federation.config.js`
      );
    }

    const dependencies = getDependentPackagesForProject(
      projectGraph,
      config.name
    );

    if (config.shared) {
      dependencies.workspaceLibraries = dependencies.workspaceLibraries.filter(
        (lib) =>
          lib.importKey && config.shared
            ? config.shared(lib.importKey, {}) !== false
            : true
      );
      dependencies.npmPackages = dependencies.npmPackages.filter((pkg) =>
        config.shared ? config.shared(pkg, {}) !== false : true
      );
    }

    resolvedConfig.sharedLibraries = shareWorkspaceLibraries(
      dependencies.workspaceLibraries
    );

    const npmPackages = sharePackages(
      Array.from(
        new Set([
          ...DEFAULT_ANGULAR_PACKAGES_TO_SHARE,
          ...dependencies.npmPackages.filter(
            (pkg) => !DEFAULT_NPM_PACKAGES_TO_AVOID.includes(pkg)
          ),
        ])
      )
    );
    DEFAULT_NPM_PACKAGES_TO_AVOID.forEach((pkgName) => {
      if (pkgName in npmPackages) {
        delete npmPackages[pkgName];
      }
    });

    resolvedConfig.sharedDependencies = {
      ...resolvedConfig.sharedLibraries.getLibraries(
        projectGraph.nodes[config.name].data.root
      ),
      ...npmPackages,
    };

    applyDefaultEagerPackages(resolvedConfig.sharedDependencies);
    applySharedFunction(resolvedConfig.sharedDependencies, config.shared);
    applyAdditionalShared(
      resolvedConfig.sharedDependencies,
      config.additionalShared,
      projectGraph
    );

    const determineRemoteUrlFn =
      options.determineRemoteUrl ||
      getFunctionDeterminateRemoteUrl(options.isServer);

    const mapRemotesFunction = options.isServer ? mapRemotesForSSR : mapRemotes;
    resolvedConfig.mappedRemotes =
      !config.remotes || config.remotes.length === 0
        ? {}
        : mapRemotesFunction(config.remotes, 'js', determineRemoteUrlFn);
  }

  return resolvedConfig;
}
