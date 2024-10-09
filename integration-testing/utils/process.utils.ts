import { check as portCheck } from 'tcp-port-used';

// eslint-disable-next-line @typescript-eslint/no-require-imports
export const kill = require('kill-port');
const KILL_PORT_DELAY = 5000;

export async function killPort(port: number): Promise<boolean> {
  if (await portCheck(port)) {
    let killPortResult;
    try {
      console.log(`Attempting to close port ${port}`);
      killPortResult = await kill(port);
      await new Promise<void>((resolve) =>
        setTimeout(() => resolve(), KILL_PORT_DELAY)
      );
      if (await portCheck(port)) {
        console.error(
          `Port ${port} still open`,
          JSON.stringify(killPortResult)
        );
      } else {
        console.log(`Port ${port} successfully closed`);
        return true;
      }
    } catch {
      console.error(`Port ${port} closing failed`);
    }
    return false;
  } else {
    return true;
  }
}
