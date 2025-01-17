import {
  ClassDeclaration,
  ClassExpression,
  Expression,
  Node,
  Project,
  Statement,
  SyntaxKind,
  ts,
  VariableDeclarationKind,
  VariableStatement,
} from 'ts-morph';
import ScriptTarget = ts.ScriptTarget;
import { hasPureAnnotation, hasSideEffects } from './utils';

const TSLIB_DECORATE_HELPER_NAME = '__decorate';

const angularStaticsToWrap = new Set([
  'ɵcmp',
  'ɵdir',
  'ɵfac',
  'ɵinj',
  'ɵmod',
  'ɵpipe',
  'ɵprov',
  'INJECTOR_KEY',
]);

const angularStaticsToElide: Record<string, (node: Expression) => boolean> = {
  ctorParameters: (node) =>
    node.isKind(SyntaxKind.FunctionExpression) ||
    node.isKind(SyntaxKind.ArrowFunction),
  decorators: (node) => node.isKind(SyntaxKind.ArrayLiteralExpression),
  propDecorators: (node) => node.isKind(SyntaxKind.ObjectLiteralExpression),
};

function canWrapProperty(
  propertyName: string,
  initializer: Expression | undefined
): boolean {
  if (angularStaticsToWrap.has(propertyName)) {
    return true;
  }

  if (!initializer) return false;

  // If there's a pure annotation, we should wrap regardless of the initializer type
  if (hasPureAnnotation(initializer)) {
    return true;
  }

  return (
    initializer.getKind() === SyntaxKind.StringLiteral ||
    initializer.getKind() === SyntaxKind.NumericLiteral ||
    initializer.getKind() === SyntaxKind.TrueKeyword ||
    initializer.getKind() === SyntaxKind.FalseKeyword
  );
}

function analyzeClassStaticProperties(
  classDeclaration: ClassDeclaration | ClassExpression
): {
  shouldWrap: boolean;
  hasSideEffects: boolean;
} {
  let shouldWrap = false;
  let _hasSideEffects = false;

  classDeclaration.getMembers().forEach((member) => {
    if (
      Node.isPropertyDeclaration(member) &&
      member.hasModifier(SyntaxKind.StaticKeyword)
    ) {
      const propertyName = member.getName();
      const initializer = member.getInitializer();

      if (initializer) {
        // Check if we should wrap due to pure annotation
        if (hasPureAnnotation(initializer)) {
          shouldWrap = true;
        } else if (canWrapProperty(propertyName, initializer)) {
          shouldWrap = true;
        } else if (hasSideEffects(initializer)) {
          _hasSideEffects = true;
        }
      }
    } else if (Node.isClassStaticBlockDeclaration(member)) {
      const statements = member.getStatements();

      for (const stmt of statements) {
        if (Node.isExpressionStatement(stmt)) {
          const expr = stmt.getExpression();

          if (Node.isBinaryExpression(expr)) {
            const left = expr.getLeft();
            const right = expr.getRight();

            if (Node.isPropertyAccessExpression(left)) {
              const propertyName = left.getName();

              if (angularStaticsToWrap.has(propertyName)) {
                shouldWrap = true;
                continue;
              }

              if (hasPureAnnotation(left)) {
                shouldWrap = true;
              } else if (canWrapProperty(propertyName, left)) {
                shouldWrap = true;
              } else if (hasSideEffects(left)) {
                _hasSideEffects = true;
              }

              if (right) {
                if (hasPureAnnotation(right)) {
                  shouldWrap = true;
                } else if (canWrapProperty(propertyName, right)) {
                  shouldWrap = true;
                } else if (hasSideEffects(right)) {
                  _hasSideEffects = true;
                }
              }
            }
          }
        }
      }
    }
  });

  return { shouldWrap, hasSideEffects: _hasSideEffects };
}

function getClosestContainer(node: Node): Node | undefined {
  let current: Node | undefined = node;
  while (current) {
    if (Node.isSourceFile(current) || Node.isBlock(current)) {
      return current;
    }
    current = current.getParent();
  }
  return undefined;
}

function analyzeClassSiblings(
  classDeclaration: ClassDeclaration | ClassExpression,
  allowWrappingDecorators?: boolean
): {
  hasPotentialSideEffects: boolean;
  wrapNodes: Statement[];
  nodesToRemove: Statement[];
  hasOnlySideEffects: boolean;
} {
  const wrapNodes: Statement[] = [];
  const nodesToRemove: Statement[] = [];
  let hasPotentialSideEffects = false;
  let sideEffectCount = 0;
  let totalCount = 0;

  const container = getClosestContainer(classDeclaration);

  if (!container) {
    return {
      hasPotentialSideEffects: true,
      wrapNodes: [],
      nodesToRemove: [],
      hasOnlySideEffects: false,
    };
  }

  // Get all siblings after the class declaration
  const siblings = container.getChildSyntaxList()?.getChildren() || [];
  const classIndex = siblings.findIndex((node) =>
    Node.isClassExpression(classDeclaration)
      ? node.getChildren().findIndex((n) => classDeclaration === n)
      : node === classDeclaration
  );
  if (classIndex === -1)
    return {
      hasPotentialSideEffects: false,
      wrapNodes: [],
      nodesToRemove: [],
      hasOnlySideEffects: false,
    };

  // Process only siblings that come after the class
  for (let i = classIndex + 1; i < siblings.length; i++) {
    const currentNode = siblings[i];
    if (!Node.isStatement(currentNode)) continue;

    if (Statement.isExpressionStatement(currentNode)) {
      const expression = currentNode.getExpression();
      totalCount++;

      if (allowWrappingDecorators && Expression.isCallExpression(expression)) {
        const callee = expression.getExpression();
        if (callee.getText() === TSLIB_DECORATE_HELPER_NAME) {
          wrapNodes.push(currentNode);
          continue;
        }
      }

      if (Expression.isBinaryExpression(expression)) {
        const left = expression.getLeft();
        const right = expression.getRight();

        if (allowWrappingDecorators && Node.isIdentifier(left)) {
          if (left.getText() === classDeclaration.getName()) {
            if (Expression.isCallExpression(right)) {
              const callee = right.getExpression();
              if (callee.getText() === TSLIB_DECORATE_HELPER_NAME) {
                wrapNodes.push(currentNode);
                continue;
              }
            }
          }
        }

        if (Expression.isPropertyAccessExpression(left)) {
          const propertyName = left.getName();

          const className = left.getExpression().getText();
          const initializer = expression.getRight();

          if (className === classDeclaration.getName()) {
            if (angularStaticsToElide[propertyName]?.(initializer)) {
              nodesToRemove.push(currentNode);
              continue;
            }

            // Then check for pure annotations
            if (
              hasPureAnnotation(currentNode) ||
              hasPureAnnotation(initializer)
            ) {
              wrapNodes.push(currentNode);
            } else if (hasSideEffects(initializer)) {
              if (!hasPureAnnotation(initializer)) {
                sideEffectCount++;
                hasPotentialSideEffects = true;
              } else {
                wrapNodes.push(currentNode);
              }
            }
            // Default case: include the node in wrapping
            else {
              wrapNodes.push(currentNode);
            }
          }
        }
      }
    }
  }

  // If we found any nodes to wrap, disable side effects flag
  if (wrapNodes.length > 0 && sideEffectCount === 0) {
    hasPotentialSideEffects = false;
  }

  return {
    hasPotentialSideEffects,
    wrapNodes,
    nodesToRemove,
    hasOnlySideEffects: sideEffectCount > 0 && sideEffectCount === totalCount,
  };
}

function wrapClassWithIIFE(
  node: ClassDeclaration | ClassExpression,
  wrapNodes: Statement[],
  variableName?: string,
  varDeclarationKind?: VariableDeclarationKind
) {
  const internalName = node.getName();

  const members = node
    .getMembers()
    .map((m) => m.getText())
    .join('\n');

  if (Node.isClassExpression(node)) {
    const outerName = variableName;

    return `
${varDeclarationKind} ${outerName} = /*#__PURE__*/ (() => {
  let ${outerName} = class ${internalName ?? ''} {
    ${members}
  };
  ${wrapNodes.map((n) => n.getText()).join('\n')}
  return ${outerName};
})();`.trim();
  } else {
    const className = internalName;
    return `
let ${className} = /*#__PURE__*/ (() => {
  class ${className} {
    ${members}
  }
  ${wrapNodes.map((n) => n.getText()).join('\n')}
  return ${className};
})();`.trim();
  }
}

const visitedClasses = new WeakSet<ClassDeclaration | ClassExpression>();
const exportDefaultAnalysis = new WeakMap<
  ClassDeclaration | ClassExpression,
  ReturnType<typeof analyzeClassSiblings>
>();

export default function adjustStaticClassMembers(
  fileContent: string,
  options: { wrapDecorators?: boolean } = { wrapDecorators: false }
): string {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: { target: ScriptTarget.ES2022 },
  });
  const sourceFile = project.createSourceFile('temp.ts', fileContent);

  // Process all classes in reverse order to handle nested classes correctly
  const classDeclarations = sourceFile.getClasses(); // class Foo {}
  const classExpressions = sourceFile.getDescendantsOfKind(
    SyntaxKind.ClassExpression
  );

  const classes = [...classDeclarations, ...classExpressions];

  for (let i = classes.length - 1; i >= 0; i--) {
    const classDeclaration = classes[i];

    if (visitedClasses.has(classDeclaration)) {
      continue;
    }

    visitedClasses.add(classDeclaration);

    const className = classDeclaration.getName();

    const isDefaultExport =
      'isDefaultExport' in classDeclaration
        ? classDeclaration.isDefaultExport()
        : false;
    const isExported = classDeclaration.hasModifier(SyntaxKind.ExportKeyword);

    // Collect all siblings first before any modifications
    let analysis = exportDefaultAnalysis.get(classDeclaration);
    if (!analysis) {
      analysis = analyzeClassSiblings(classDeclaration, options.wrapDecorators);
    }
    const { shouldWrap, hasSideEffects: propHasSideEffects } =
      analyzeClassStaticProperties(classDeclaration);

    const {
      hasPotentialSideEffects,
      wrapNodes,
      nodesToRemove,
      hasOnlySideEffects,
    } = analysis;

    // Skip if only side effects
    if (hasOnlySideEffects || hasPotentialSideEffects || propHasSideEffects) {
      continue;
    }

    // Create the modifications array to process them in order
    const modifications: Array<() => void> = [];

    // Add removal operations first
    nodesToRemove.forEach((node) => {
      modifications.push(() => {
        if (!node.wasForgotten()) {
          node.remove();
        }
      });
    });

    // Handle wrapping if needed
    if (wrapNodes.length > 0 || shouldWrap) {
      const exportPrefix = isExported && !isDefaultExport ? 'export ' : '';

      modifications.push(() => {
        if (isDefaultExport) {
          classDeclaration.toggleModifier('default', false);
          classDeclaration.toggleModifier('export', false);
          sourceFile.addExportDeclaration({
            namedExports: [{ name: className!, alias: 'default' }],
          });
        } else if (isExported) {
          classDeclaration.toggleModifier('export', false);
        }
      });

      modifications.push(() => {
        let wrappedClass: string;
        let varStmt: VariableStatement | undefined;
        if (Node.isClassExpression(classDeclaration)) {
          // 1) Look for a VariableDeclaration ancestor
          const variableDecl = classDeclaration.getFirstAncestorByKind(
            SyntaxKind.VariableDeclaration
          );

          // 2) Extract the variable name (the left-hand side)
          const variableName = variableDecl?.getName();

          // 3) Call your wrap function with the variable name
          varStmt = variableDecl
            ?.getParentIfKind(SyntaxKind.VariableDeclarationList)
            ?.getParentIfKind(SyntaxKind.VariableStatement);

          const varDeclarationKind = varStmt?.getDeclarationKind();

          wrappedClass = wrapClassWithIIFE(
            classDeclaration,
            wrapNodes,
            variableName,
            varDeclarationKind
          );

          // 4) Replace the entire variable statement text (or just the variable declaration)
          // so the new code is `var Foo = /*#__PURE__*/ ( ... )();`
        } else {
          // Remove wrap nodes only after getting their text
          wrappedClass = `${exportPrefix}${wrapClassWithIIFE(
            classDeclaration,
            wrapNodes
          )}`;
        }

        wrapNodes.forEach((node) => {
          if (!node.wasForgotten()) {
            node.remove();
          }
        });

        if (!classDeclaration.wasForgotten()) {
          if (varStmt) {
            varStmt.replaceWithText(wrappedClass);
          } else {
            classDeclaration.replaceWithText(wrappedClass);
          }
        }
      });
    } else if (isDefaultExport) {
      modifications.push(() => {
        classDeclaration.toggleModifier('default', false);
        classDeclaration.toggleModifier('export', false);
        sourceFile.addExportDeclaration({
          namedExports: [{ name: className!, alias: 'default' }],
        });
      });
    }

    // Apply all modifications in order
    modifications.forEach((mod) => mod());
  }

  return sourceFile.getFullText();
}
