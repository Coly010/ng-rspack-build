import { Expression, Node, SyntaxKind } from 'ts-morph';

export function hasPureAnnotation(node: Node): boolean {
  // first try official comment ranges
  const leading = node.getLeadingCommentRanges() ?? [];
  const trailing = node.getTrailingCommentRanges() ?? [];
  for (const comment of [...leading, ...trailing]) {
    const text = comment.getText();
    if (
      text.includes('@__PURE__') ||
      text.includes('/*#__PURE__*/') ||
      text.includes('#__PURE__') ||
      text.includes('@pureOrBreakMyCode')
    ) {
      return true;
    }
  }

  // fallback: look in the raw text
  const rawText = node.getFullText();
  if (
    rawText.includes('@__PURE__') ||
    rawText.includes('/*#__PURE__*/') ||
    rawText.includes('#__PURE__') ||
    rawText.includes('@pureOrBreakMyCode')
  ) {
    return true;
  }

  return false;
}

export function hasSideEffects(node: Node | undefined): boolean {
  if (!node) return false;

  if (hasPureAnnotation(node)) {
    return false;
  }

  if (node.isKind(SyntaxKind.CallExpression)) {
    const callExpression = node.asKind(SyntaxKind.CallExpression);
    if (!callExpression) return false;

    const callee = callExpression.getExpression();
    if (callee.isKind(SyntaxKind.ParenthesizedExpression)) {
      return false;
    }
    return !hasPureAnnotation(node);
  }

  if (node.isKind(SyntaxKind.PropertyAccessExpression)) {
    const text = node.getText();
    if (
      text.startsWith('console.') ||
      text.startsWith('process.') ||
      text.startsWith('globalThis.') ||
      text.startsWith('window.') ||
      text.startsWith('document.') ||
      text.startsWith('global.')
    ) {
      return true;
    }
  }

  if (node.isKind(SyntaxKind.NewExpression)) {
    return true;
  }

  if (
    node.isKind(SyntaxKind.FunctionExpression) ||
    node.isKind(SyntaxKind.ArrowFunction)
  ) {
    return false;
  }

  if (node.isKind(SyntaxKind.BinaryExpression)) {
    const binaryExpr = node as any;
    if (binaryExpr.operatorToken.kind === SyntaxKind.EqualsToken) {
      const left = binaryExpr.left;
      if (Node.isPropertyAccessExpression(left)) {
        const propertyText = left.getText();
        if (
          propertyText.startsWith('console.') ||
          propertyText.startsWith('process.') ||
          propertyText.startsWith('globalThis.') ||
          propertyText.startsWith('window.') ||
          propertyText.startsWith('document.') ||
          propertyText.startsWith('global.')
        ) {
          return true;
        }
      }
      return hasSideEffects(binaryExpr.right);
    }
  }

  if (
    node.isKind(SyntaxKind.ArrayLiteralExpression) ||
    node.isKind(SyntaxKind.ObjectLiteralExpression)
  ) {
    return false;
  }

  if (
    node.isKind(SyntaxKind.StringLiteral) ||
    node.isKind(SyntaxKind.NumericLiteral) ||
    node.isKind(SyntaxKind.TrueKeyword) ||
    node.isKind(SyntaxKind.FalseKeyword)
  ) {
    return false;
  }

  return false;
}

/**
 * Helper function for better readability
 * @param node
 */
export function isPure(node: Node): boolean {
  return !hasSideEffects(node);
}

export function annotateAsPure(text: string) {
  return `/*#__PURE__*/ ${text}`;
}

export function isAssignmentExpression(node: Node) {
  return (
    Node.isBinaryExpression(node) &&
    node.getOperatorToken().getKind() === SyntaxKind.EqualsToken
  );
}

export function bindingIdentifierEquals(
  leftCallArgument: Node,
  declarationId: Node
): boolean {
  // Get symbols for both nodes
  const leftCallSymbol = leftCallArgument.getSymbol();
  const declarationSymbol = declarationId.getSymbol();

  // If either symbol is undefined, they cannot refer to the same binding
  if (!leftCallSymbol || !declarationSymbol) {
    return false;
  }

  // Check if both symbols are the same
  return leftCallSymbol === declarationSymbol;
}
