import {
  Project,
  ScriptTarget,
  SyntaxKind,
  VariableDeclarationKind,
  VariableStatement,
  Node,
  VariableDeclarationList,
  CatchClause,
  ExpressionStatement,
  Expression,
} from 'ts-morph';
import {
  annotateAsPure,
  isPure,
  isAssignmentExpression,
  bindingIdentifierEquals,
} from './utils';

export default function adjustTypeScriptEnums(input: string): string {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: { target: ScriptTarget.ES2022 },
  });
  const sourceFile = project.createSourceFile('temp.ts', input);

  const variableStatements = sourceFile.getVariableStatements();

  for (const statement of variableStatements) {
    if (checkVariableDeclarationIsNotVar(statement)) {
      continue;
    }

    const declaration = statement.getDeclarations()[0];
    if (declaration.getInitializer()) {
      continue;
    }

    const declarationId = declaration.getNameNode();
    if (!Node.isIdentifier(declarationId)) {
      continue;
    }

    const parent = declaration.getParent();
    const hasExport = checkIsExport(parent);
    const origin = (hasExport ? parent : statement) as
      | VariableStatement
      | VariableDeclarationList;
    const nextStatement = getNextSibling(origin);
    if (!nextStatement || !Node.isExpressionStatement(nextStatement)) {
      continue;
    }

    const nextExpression = nextStatement.getExpression();
    if (
      !Node.isCallExpression(nextExpression) ||
      nextExpression.getArguments().length !== 1
    ) {
      continue;
    }

    const enumCallArgument = nextExpression.getArguments()[0];
    if (
      !(
        Node.isBinaryExpression(enumCallArgument) &&
        enumCallArgument.getOperatorToken().getKind() === SyntaxKind.BarBarToken
      )
    ) {
      continue;
    }

    const leftCallArgument = enumCallArgument.getLeft();
    let rightCallArgument = enumCallArgument.getRight();
    if (Node.isParenthesizedExpression(rightCallArgument)) {
      rightCallArgument = rightCallArgument.getExpression();
    }

    if (
      !Node.isIdentifier(leftCallArgument) ||
      !bindingIdentifierEquals(leftCallArgument, declarationId) ||
      !isAssignmentExpression(rightCallArgument)
    ) {
      continue;
    }

    let enumCallee: Expression = nextExpression.getExpression();
    if (Node.isParenthesizedExpression(enumCallee)) {
      enumCallee = enumCallee.getExpression();
    }

    if (
      !Node.isFunctionExpression(enumCallee) ||
      enumCallee.getParameters().length !== 1
    ) {
      continue;
    }

    const parameterId = enumCallee.getParameters()[0].getNameNode();
    if (!Node.isIdentifier(parameterId)) {
      continue;
    }

    let hasElements = false;
    const functionBody = enumCallee.getBody();

    if (!functionBody || !Node.isBlock(functionBody)) {
      continue;
    }

    const bodyStatements = functionBody.getStatements();

    for (const enumStatement of bodyStatements) {
      if (!Node.isExpressionStatement(enumStatement)) {
        continue;
      }

      const enumValueAssignment = enumStatement.getExpression();
      if (
        !isAssignmentExpression(enumValueAssignment) ||
        !Node.isBinaryExpression(enumValueAssignment) ||
        !isPure(enumValueAssignment.getRight())
      ) {
        break;
      }
      hasElements = true;
    }

    if (!hasElements) {
      continue;
    }

    if (
      Node.isBinaryExpression(rightCallArgument) &&
      Node.isIdentifier(rightCallArgument.getLeft())
    ) {
      const rightCallRightNode = rightCallArgument.getRight();
      rightCallArgument.replaceWithText(rightCallRightNode.getText());
    }

    const body = enumCallee.getBody();
    if (body && Node.isBlock(body)) {
      const parameterIdText = parameterId.getText();

      body.addStatements(`return ${parameterIdText};`);
    }

    let enumInitializer = nextExpression.getText();

    (nextExpression.getParent() as ExpressionStatement)?.remove();

    enumInitializer = annotateAsPure(enumInitializer);

    const initializer = declaration.getInitializer();
    if (initializer) {
      initializer.replaceWithText(enumInitializer);
    } else {
      declaration.setInitializer(enumInitializer);
    }
  }

  return sourceFile.getFullText();
}

function checkVariableDeclarationIsNotVar(node: VariableStatement) {
  return (
    node.getDeclarationList().getDeclarationKind() !==
      VariableDeclarationKind.Var || node.getDeclarations().length !== 1
  );
}

function checkIsExport(node: VariableDeclarationList | CatchClause) {
  if (Node.isCatchClause(node)) {
    return false;
  }
  return (
    node.hasModifier(SyntaxKind.ExportKeyword) ||
    node.isKind(SyntaxKind.ExportAssignment)
  );
}

function getNextSibling(node: VariableStatement | VariableDeclarationList) {
  let parent = node.getParent();
  if (!parent) {
    return;
  }

  if (Node.isSourceFile(parent)) {
    parent = parent.getChildAtIndex(0);
  }

  const siblings = parent.getChildren();
  const index = siblings.indexOf(node);
  if (index >= 0 && index + 1 < siblings.length) {
    return siblings[index + 1];
  }
  return;
}
