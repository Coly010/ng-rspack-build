import { Node, Project, ScriptTarget, SyntaxKind } from 'ts-morph';
import { getFunctionParent } from './utils';

/**
 * The name of the Angular class metadata function created by the Angular compiler.
 */
const SET_CLASS_METADATA_NAME = 'ɵsetClassMetadata';

/**
 * Name of the asynchronous Angular class metadata function created by the Angular compiler.
 */
const SET_CLASS_METADATA_ASYNC_NAME = 'ɵsetClassMetadataAsync';

/**
 * Name of the function that sets debug information on classes.
 */
const SET_CLASS_DEBUG_INFO_NAME = 'ɵsetClassDebugInfo';

/**
 * An object map of function names and related value checks for discovery of Angular generated
 * metadata calls.
 */
const angularMetadataFunctions: Record<string, (args: Node[]) => boolean> = {
  [SET_CLASS_METADATA_NAME]: isSetClassMetadataCall,
  [SET_CLASS_METADATA_ASYNC_NAME]: isSetClassMetadataAsyncCall,
  [SET_CLASS_DEBUG_INFO_NAME]: isSetClassDebugInfoCall,
};

export default function elideAngularMetadata(input: string): string {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: { target: ScriptTarget.ES2022 },
  });
  const sourceFile = project.createSourceFile('temp.ts', input);
  const callExpressions = sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression
  );

  for (const callExpression of callExpressions) {
    const callee = callExpression.getExpression();
    let calleeName: string | undefined;
    if (Node.isPropertyAccessExpression(callee)) {
      const calleeProperty = callee.getNameNode();
      if (Node.isIdentifier(calleeProperty)) {
        calleeName = calleeProperty.getText();
      }
    } else if (Node.isElementAccessExpression(callee)) {
      const calleeArgument = callee.getArgumentExpression();
      if (Node.isStringLiteral(calleeArgument)) {
        calleeName = calleeArgument.getLiteralValue();
      }
    } else if (Node.isIdentifier(callee)) {
      calleeName = callee.getText();
    }

    if (!calleeName) {
      continue;
    }

    const callArguments = callExpression.getArguments();

    if (
      Object.hasOwn(angularMetadataFunctions, calleeName) &&
      angularMetadataFunctions[calleeName](callArguments)
    ) {
      const parent = getFunctionParent(callExpression);

      if (
        parent &&
        (Node.isFunctionExpression(parent) || Node.isArrowFunction(parent))
      ) {
        // Replace the current node with `void 0`
        callExpression.replaceWithText('void 0');
        break;
      }
    }
  }

  return sourceFile.getFullText();
}

/** Determines if a function call is a call to `setClassMetadata`. */
function isSetClassMetadataCall(callArguments: Node[]): boolean {
  // `setClassMetadata` calls have to meet the following criteria:
  // * First must be an identifier
  // * Second must be an array literal
  return (
    callArguments.length === 4 &&
    Node.isIdentifier(callArguments[0]) &&
    Node.isArrayLiteralExpression(callArguments[1])
  );
}

/** Determines if a function call is a call to `setClassMetadataAsync`. */
function isSetClassMetadataAsyncCall(callArguments: Node[]): boolean {
  // `setClassMetadataAsync` calls have to meet the following criteria:
  // * First argument must be an identifier.
  // * Second argument must be an inline function.
  // * Third argument must be an inline function.
  return (
    callArguments.length === 3 &&
    Node.isIdentifier(callArguments[0]) &&
    isInlineFunction(callArguments[1]) &&
    isInlineFunction(callArguments[2])
  );
}

/** Determines if a function call is a call to `setClassDebugInfo`. */
function isSetClassDebugInfoCall(callArguments: Node[]): boolean {
  return (
    callArguments.length === 2 &&
    Node.isIdentifier(callArguments[0]) &&
    Node.isObjectLiteralExpression(callArguments[1])
  );
}

/** Determines if a node is an inline function expression. */
function isInlineFunction(path: Node): boolean {
  return Node.isFunctionExpression(path) || Node.isArrowFunction(path);
}
