import { type RsbuildPlugin } from '@rsbuild/core';
import { PluginAngularOptions } from './models';
export declare const pluginAngular: (
  options?: Partial<PluginAngularOptions>
) => RsbuildPlugin;
