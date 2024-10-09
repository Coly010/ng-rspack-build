import { getProjectDirectory } from './project.utils';
import { ChildProcess, exec } from 'child_process';

export async function runCommand(
  command: string
): Promise<{ stdout: string; stderr: string; combinedOutput: string }> {
  return new Promise((resolve, reject) => {
    exec(
      `npx ${command}`,
      {
        cwd: getProjectDirectory(),
        env: process.env,
        encoding: 'utf-8',
        maxBuffer: 50 * 1024 * 1024,
      },
      (err, stdout, stderr) => {
        if (err) {
          console.error(
            `Original command: ${command}`,
            `${stdout}\n\n${stderr}`
          );
          reject(err);
        }
        const outputs = {
          stdout: stripConsoleColors(stdout),
          stderr: stripConsoleColors(stderr),
          combinedOutput: stripConsoleColors(`${stdout}${stderr}`),
        };

        resolve(outputs);
      }
    );
  });
}

export async function runCommandUntil(
  command: string,
  criteria: (output: string) => boolean
): Promise<ChildProcess> {
  const p = exec(`npx ${command}`, {
    cwd: getProjectDirectory(),
    encoding: 'utf-8',
    env: process.env,
    windowsHide: true,
  });
  return new Promise((res, rej) => {
    let output = '';
    let complete = false;

    function checkCriteria(c) {
      output += c.toString();
      if (criteria(stripConsoleColors(output)) && !complete) {
        complete = true;
        res(p);
      }
    }

    p.stdout?.on('data', checkCriteria);
    p.stderr?.on('data', checkCriteria);
    p.on('exit', (code) => {
      if (!complete) {
        console.error(
          `Original output:`,
          output
            .split('\n')
            .map((l) => `    ${l}`)
            .join('\n')
        );
        rej(`Exited with ${code}`);
      } else {
        res(p);
      }
    });
  });
}

function stripConsoleColors(log: string): string {
  return log?.replace(
    // eslint-disable-next-line no-control-regex
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ''
  );
}
