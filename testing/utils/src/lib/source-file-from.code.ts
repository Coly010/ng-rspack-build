import { Project } from 'ts-morph';

export const sourceFileFromCode = ({
  path,
  code,
}: {
  path?: string;
  code: string;
}) => {
  const project = new Project({ useInMemoryFileSystem: true });
  return project.createSourceFile(path ?? 'cmp.ts', code);
};
