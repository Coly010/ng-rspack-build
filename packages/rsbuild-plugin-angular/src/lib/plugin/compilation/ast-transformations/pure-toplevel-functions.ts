import {
  Project,
  ScriptTarget,
  SourceFile,
  SyntaxKind,
  Node,
  Expression,
} from 'ts-morph';
import * as tslib from 'tslib';
import { annotateAsPure, getFunctionParent } from './utils';

const tslibHelpers = new Set<string>(
  Object.keys(tslib).filter((h) => h.startsWith('__'))
);
const babelHelpers = new Set<string>(['_defineProperty']);

export default function pureTopLevelFunctions(input: string): string {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: { target: ScriptTarget.ES2022 },
  });
  const sourceFile = project.createSourceFile('temp.ts', input);

  handleCallExpressions(sourceFile);
  handleNewExpressions(sourceFile);

  return sourceFile.getFullText();
}

function handleCallExpressions(sourceFile: SourceFile) {
  const callExpressions = sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression
  );
  for (const callExpression of callExpressions) {
    if (getFunctionParent(callExpression)) {
      continue;
    }

    let callee: Expression = callExpression.getExpression();
    if (Node.isParenthesizedExpression(callee)) {
      callee = callee.getExpression();
    }
    if (
      (Node.isFunctionExpression(callee) || Node.isArrowFunction(callee)) &&
      callExpression.getArguments().length !== 0
    ) {
      continue;
    }

    if (
      Node.isIdentifier(callee) &&
      (isTslibHelperName(callee.getText()) ||
        isBabelHelperName(callee.getText()))
    ) {
      continue;
    }
    callExpression.replaceWithText(annotateAsPure(callExpression.getText()));
    break;
  }
}

function handleNewExpressions(sourceFile: SourceFile) {
  const newExpressions = sourceFile.getDescendantsOfKind(
    SyntaxKind.NewExpression
  );
  for (const newExpression of newExpressions) {
    if (!getFunctionParent(newExpression)) {
      newExpression.replaceWithText(annotateAsPure(newExpression.getText()));
      break;
    }
  }
}

function isTslibHelperName(name: string): boolean {
  const nameParts = name.split('$');
  const originalName = nameParts[0];

  if (
    nameParts.length > 2 ||
    (nameParts.length === 2 && isNaN(+nameParts[1]))
  ) {
    return false;
  }

  return tslibHelpers.has(originalName);
}

function isBabelHelperName(name: string): boolean {
  return babelHelpers.has(name);
}
