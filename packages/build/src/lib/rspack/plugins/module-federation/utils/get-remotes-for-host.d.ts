import { type ProjectGraph } from '@nx/devkit';
import { ModuleFederationConfig } from '../../../types/module-federation';
interface ModuleFederationExecutorContext {
  projectName: string;
  projectGraph: ProjectGraph;
  root: string;
}
export declare function getRemotes(
  devRemotes: string[],
  skipRemotes: string[],
  config: ModuleFederationConfig,
  context: ModuleFederationExecutorContext,
  pathToManifestFile?: string
): {
  staticRemotes: string[];
  devRemotes: string[];
  dynamicRemotes: string[];
  remotePorts: any[];
  staticRemotePort: number;
};
export declare function getModuleFederationConfig(
  tsconfigPath: string,
  workspaceRoot: string,
  projectRoot: string,
  pluginName?: string
): any;
export {};
