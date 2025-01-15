import { Compiler, RspackPluginInstance } from '@rspack/core';
import {
  ModuleFederationConfig,
  StaticRemoteConfig,
  StaticRemotesConfig,
} from '../../types/module-federation';
import {
  readCachedProjectGraph,
  readProjectsConfigurationFromProjectGraph,
} from 'nx/src/project-graph/project-graph';
import { basename, dirname, extname, join, resolve } from 'path';
import { cpSync, existsSync, readFileSync } from 'fs';
import { ProjectGraph, workspaceRoot } from '@nx/devkit';
import { getRemotes } from './utils/get-remotes-for-host';
import { fork } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { workspaceDataDirectory } from 'nx/src/utils/cache-directory';
import { readModulePackageJson } from 'nx/src/utils/package-json';
import type { Express } from 'express';
import {
  getDynamicMfManifestFile,
  validateDevRemotes,
} from './utils/dev-remote-utils';

export class NgRspackModuleFederationDevServerPlugin
  implements RspackPluginInstance
{
  private nxBin: string;

  constructor(
    private _options: {
      moduleFederationConfig: ModuleFederationConfig;
      devRemotes: string[];
      skipRemotes: string[];
      host: string;
      staticRemotesPort?: number;
      pathToManifestFile?: string;
      ssl?: boolean;
      sslCert?: string;
      sslKey?: string;
      parallel?: number;
    }
  ) {
    this.nxBin = require.resolve('nx/bin/nx');
  }

  apply(compiler: Compiler) {
    compiler.hooks.beforeCompile.tapAsync(
      'NgRspackModuleFederationDevServerPlugin',
      async (params, callback) => {
        const { staticRemotesConfig, remotes } = this.setup();
        const mappedLocationOfRemotes = await this.buildStaticRemotes(
          staticRemotesConfig
        );
        this.startRemotes(remotes.devRemotes);
        this.startStaticRemotesFileServer(
          staticRemotesConfig,
          compiler.context
        );
        this.startRemoteProxies(
          staticRemotesConfig,
          mappedLocationOfRemotes!,
          this._options.ssl
            ? {
                pathToCert: this._options.sslCert!,
                pathToKey: this._options.sslKey!,
              }
            : undefined
        );
        callback();
      }
    );
  }

  private setup() {
    const projectGraph = readCachedProjectGraph();
    const { projects: workspaceProjects } =
      readProjectsConfigurationFromProjectGraph(projectGraph);
    const project =
      workspaceProjects[this._options.moduleFederationConfig.name];
    if (!this._options.pathToManifestFile) {
      this._options.pathToManifestFile = getDynamicMfManifestFile(
        project,
        workspaceRoot
      );
    } else {
      const userPathToManifestFile = join(
        workspaceRoot,
        this._options.pathToManifestFile
      );
      if (!existsSync(userPathToManifestFile)) {
        throw new Error(
          `The provided Module Federation manifest file path does not exist. Please check the file exists at "${userPathToManifestFile}".`
        );
      } else if (extname(this._options.pathToManifestFile) !== '.json') {
        throw new Error(
          `The Module Federation manifest file must be a JSON. Please ensure the file at ${userPathToManifestFile} is a JSON.`
        );
      }

      this._options.pathToManifestFile = userPathToManifestFile;
    }

    validateDevRemotes(
      { devRemotes: this._options.devRemotes },
      workspaceProjects
    );

    const remoteNames = this._options.devRemotes.map((r) => r);

    const remotes = getRemotes(
      remoteNames,
      this._options.skipRemotes,
      this._options.moduleFederationConfig,
      {
        projectName: project.name ?? '',
        projectGraph,
        root: workspaceRoot,
      },
      this._options.pathToManifestFile
    );

    this._options.staticRemotesPort ??= remotes.staticRemotePort;

    // Set NX_MF_DEV_REMOTES for the Nx Runtime Library Control Plugin
    process.env['NX_MF_DEV_REMOTES'] = JSON.stringify([
      ...(remotes.devRemotes.map((r) => r) ?? []),
      project.name,
    ]);

    const staticRemotesConfig = this.parseStaticRemotesConfig(
      [...remotes.staticRemotes, ...remotes.dynamicRemotes],
      projectGraph
    );

    return { staticRemotesConfig, remotes };
  }

  parseStaticRemotesConfig(
    staticRemotes: string[] | undefined,
    projectGraph: ProjectGraph
  ): StaticRemotesConfig {
    if (!staticRemotes?.length) {
      return { remotes: [], config: undefined };
    }

    const config: Record<string, StaticRemoteConfig> = {};
    for (const app of staticRemotes) {
      const outputPath =
        projectGraph.nodes[app].data.targets?.['build'].options.outputPath;
      const basePath = dirname(outputPath);
      const urlSegment = basename(outputPath);
      const port = projectGraph.nodes[app].data.targets?.['serve'].options.port;
      config[app] = { basePath, outputPath, urlSegment, port };
    }

    return { remotes: staticRemotes, config };
  }

  async buildStaticRemotes(staticRemotesConfig: StaticRemotesConfig) {
    if (!staticRemotesConfig.remotes.length) {
      return;
    }
    const mappedLocationOfRemotes: Record<string, string> = {};
    for (const app of staticRemotesConfig.remotes) {
      mappedLocationOfRemotes[app] = `http${this._options.ssl ? 's' : ''}://${
        this._options.host
      }:${this._options.staticRemotesPort}/${
        staticRemotesConfig.config?.[app].urlSegment
      }`;
    }

    await new Promise<void>((res, rej) => {
      console.log(
        `NX Building ${staticRemotesConfig.remotes.length} static remotes...`
      );
      const staticProcess = fork(
        this.nxBin,
        [
          'run-many',
          `--target=build`,
          `--projects=${staticRemotesConfig.remotes.join(',')}`,
          ...(this._options.parallel
            ? [`--parallel=${this._options.parallel}`]
            : []),
        ],
        {
          cwd: workspaceRoot,
          stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
        }
      );
      // File to debug build failures e.g. 2024-01-01T00_00_0_0Z-build.log'
      const remoteBuildLogFile = join(
        workspaceDataDirectory,
        // eslint-disable-next-line
        `${new Date().toISOString().replace(/[:\.]/g, '_')}-build.log`
      );
      const stdoutStream = createWriteStream(remoteBuildLogFile);
      staticProcess.stdout?.on('data', (data) => {
        const ANSII_CODE_REGEX =
          // eslint-disable-next-line no-control-regex
          /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
        const stdoutString = data.toString().replace(ANSII_CODE_REGEX, '');
        stdoutStream.write(stdoutString);

        // in addition to writing into the stdout stream, also show error directly in console
        // so the error is easily discoverable. 'ERROR in' is the key word to search in webpack output.
        if (stdoutString.includes('ERROR in')) {
          console.log(stdoutString);
        }

        if (stdoutString.includes('Successfully ran target build')) {
          staticProcess.stdout?.removeAllListeners('data');
          console.info(
            `NX Built ${staticRemotesConfig.remotes.length} static remotes`
          );
          res();
        }
      });
      staticProcess.stderr?.on('data', (data) => console.log(data.toString()));
      staticProcess.once('exit', (code) => {
        stdoutStream.end();
        staticProcess.stdout?.removeAllListeners('data');
        staticProcess.stderr?.removeAllListeners('data');
        if (code !== 0) {
          rej(
            `Remote failed to start. A complete log can be found in: ${remoteBuildLogFile}`
          );
        } else {
          res();
        }
      });
      process.on('SIGTERM', () => staticProcess.kill('SIGTERM'));
      process.on('exit', () => staticProcess.kill('SIGTERM'));
    });

    return mappedLocationOfRemotes;
  }

  private startRemotes(devRemotes: string[]) {
    for (const remote of devRemotes) {
      const serveProcess = fork(this.nxBin, ['serve', `${remote}`], {
        cwd: workspaceRoot,
        stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
      });
      process.on('SIGTERM', () => serveProcess.kill('SIGTERM'));
      process.on('exit', () => serveProcess.kill('SIGTERM'));
    }
  }

  private startStaticRemotesFileServer(
    staticRemotesConfig: StaticRemotesConfig,
    root: string
  ) {
    if (
      !staticRemotesConfig.remotes ||
      staticRemotesConfig.remotes.length === 0
    ) {
      return;
    }
    let shouldMoveToCommonLocation = false;
    let commonOutputDirectory: string | undefined;
    for (const app of staticRemotesConfig.remotes) {
      const remoteBasePath = staticRemotesConfig.config?.[app].basePath;
      if (!commonOutputDirectory) {
        commonOutputDirectory = remoteBasePath;
      } else if (commonOutputDirectory !== remoteBasePath) {
        shouldMoveToCommonLocation = true;
        break;
      }
    }

    if (shouldMoveToCommonLocation) {
      commonOutputDirectory = join(workspaceRoot, 'tmp/static-remotes');
      for (const app of staticRemotesConfig.remotes) {
        const remoteConfig = staticRemotesConfig.config?.[app];
        if (remoteConfig) {
          cpSync(
            remoteConfig.outputPath,
            join(commonOutputDirectory, remoteConfig.urlSegment),
            {
              force: true,
              recursive: true,
            }
          );
        }
      }
    }
    const { path: pathToHttpServerPkgJson, packageJson } =
      readModulePackageJson('http-server', module.paths);
    const pathToHttpServerBin = (packageJson.bin! as Record<string, string>)[
      'http-server'
    ] as string;
    const pathToHttpServer = resolve(
      pathToHttpServerPkgJson.replace('package.json', ''),
      pathToHttpServerBin
    );
    const httpServerProcess = fork(
      pathToHttpServer,
      [
        commonOutputDirectory!,
        `-p=${this._options.staticRemotesPort}`,
        `-a=localhost`,
        `--cors`,
      ],
      {
        stdio: 'pipe',
        cwd: root,
        env: {
          FORCE_COLOR: 'true',
          ...process.env,
        },
      }
    );
    process.on('SIGTERM', () => httpServerProcess.kill('SIGTERM'));
    process.on('exit', () => httpServerProcess.kill('SIGTERM'));
  }

  private startRemoteProxies(
    staticRemotesConfig: StaticRemotesConfig,
    mappedLocationsOfRemotes: Record<string, string>,
    sslOptions?: { pathToCert: string; pathToKey: string }
  ) {
    const { createProxyMiddleware } = require('http-proxy-middleware');
    const express = require('express');
    let sslCert: Buffer | undefined;
    let sslKey: Buffer | undefined;
    if (sslOptions && sslOptions.pathToCert && sslOptions.pathToKey) {
      if (
        existsSync(sslOptions.pathToCert) &&
        existsSync(sslOptions.pathToKey)
      ) {
        sslCert = readFileSync(sslOptions.pathToCert);
        sslKey = readFileSync(sslOptions.pathToKey);
      } else {
        console.warn(
          `Encountered SSL options in project.json, however, the certificate files do not exist in the filesystem. Using http.`
        );
        console.warn(
          `Attempted to find '${sslOptions.pathToCert}' and '${sslOptions.pathToKey}'.`
        );
      }
    }
    const http = require('http');
    const https = require('https');

    console.log(`NX Starting static remotes proxies...`);
    for (const app of staticRemotesConfig.remotes) {
      const expressProxy: Express = express();
      expressProxy.use(
        createProxyMiddleware({
          target: mappedLocationsOfRemotes[app],
          changeOrigin: true,
          secure: sslCert ? false : undefined,
        })
      );
      const proxyServer = (sslCert ? https : http)
        .createServer({ cert: sslCert, key: sslKey }, expressProxy)
        .listen(staticRemotesConfig.config?.[app].port);
      process.on('SIGTERM', () => proxyServer.close());
      process.on('exit', () => proxyServer.close());
    }
    console.info(`NX Static remotes proxies started successfully`);
  }
}
