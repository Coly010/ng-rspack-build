import { describe, expect } from 'vitest';
import { getAllTextByProperty, getTextByProperty } from './utils';
import { SyntaxKind } from 'ts-morph';
import { sourceFileFromCode } from 'testing-utils';

describe('getTextByProperty', () => {
  it.each(["'", '"', '`'])(
    'should return the property value containing (%s) quotes if set',
    (quote) => {
      const styleUrl = 'button.component.scss';
      const sourceFile = sourceFileFromCode({
        code: `
      @Component({
        styleUrl: ${quote}${styleUrl}${quote}',
      })
      export class ButtonComponent {}
      `,
      });
      const properties = sourceFile.getDescendantsOfKind(
        SyntaxKind.PropertyAssignment
      );

      expect(getTextByProperty('styleUrl', properties)).toStrictEqual([
        styleUrl,
      ]);
    }
  );

  it('should return the property value if not set', () => {
    const sourceFile = sourceFileFromCode({
      code: `
      @Component({})
      export class ButtonComponent {}
      `,
    });
    const properties = sourceFile.getDescendantsOfKind(
      SyntaxKind.PropertyAssignment
    );

    expect(getTextByProperty('styleUrl', properties)).toStrictEqual([]);
  });
});

describe('getAllTextByProperty', () => {
  it.each(["'", '"', '`'])(
    'should return the property value containing (%s) quotes if set',
    (quote) => {
      const styleUrl = 'button.component.scss';
      const sourceFile = sourceFileFromCode({
        code: `
      @Component({
        styleUrls: [${quote}${styleUrl}${quote}]',
      })
      export class ButtonComponent {}
      `,
      });
      const properties = sourceFile.getDescendantsOfKind(
        SyntaxKind.PropertyAssignment
      );

      expect(getAllTextByProperty('styleUrls', properties)).toStrictEqual([
        styleUrl,
      ]);
    }
  );

  it('should return the property value if not set', () => {
    const sourceFile = sourceFileFromCode({
      code: `
      @Component({})
      export class ButtonComponent {}
      `,
    });
    const properties = sourceFile.getDescendantsOfKind(
      SyntaxKind.PropertyAssignment
    );

    expect(getAllTextByProperty('styleUrls', properties)).toStrictEqual([]);
  });
});
