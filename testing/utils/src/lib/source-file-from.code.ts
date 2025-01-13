import { Project } from 'ts-morph';
import type { SourceFile as TsSourceFile } from 'typescript';

export const sourceFileFromCode = ({
  path,
  code,
}: {
  path?: string;
  code: string;
}) => {
  const project = new Project({ useInMemoryFileSystem: true });
  const tsMorphSourceFile = project.createSourceFile(path ?? 'cmp.ts', code);
  return tsMorphSourceFile as unknown as TsSourceFile
};
