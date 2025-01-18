let load;
export function loadCompilerCli(): Promise<
  typeof import('@angular/compiler-cli')
> {
  load ??= new Function('', `return import('@angular/compiler-cli');`);
  return load();
}
