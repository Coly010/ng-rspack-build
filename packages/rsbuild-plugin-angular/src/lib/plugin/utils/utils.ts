import { platform } from 'node:os';

export const isUsingWindows = () => platform() === 'win32';
