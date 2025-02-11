import { describe, expect } from 'vitest';
import { isUsingWindows } from './utils.ts';
import * as osModule from 'node:os';
import {
  getAllTextByProperty,
  getTextByProperty,
  normalizeQuotes,
} from './utils';
import { SyntaxKind } from 'ts-morph';
import { sourceFileFromCode } from '@ng-rspack/testing-utils';

vi.mock('node:os', async (importOriginal) => {
  const actual = await importOriginal<typeof osModule>();

  return {
    ...actual,
    platform: vi.fn(),
  };
});

describe('isUsingWindows', async () => {
  it('should return true if the platform is win32', () => {
    const platformSpy = vi.spyOn(osModule, 'platform').mockReturnValue('win32');
    expect(isUsingWindows()).toBe(true);
    expect(platformSpy).toHaveBeenCalledTimes(1);
  });

  it.each([
    'aix',
    'android',
    'darwin',
    'freebsd',
    'haiku',
    'linux',
    'openbsd',
    'sunos',
    'cygwin',
    'netbsd',
  ] as const)('should return false if platform is %s', (platform) => {
    const platformSpy = vi
      .spyOn(osModule, 'platform')
      .mockReturnValue(platform);
    expect(isUsingWindows()).toBe(false);
    expect(platformSpy).toHaveBeenCalledTimes(1);
  });
});

describe('normalizeQuotes', () => {

  it.each(["'", '"', '`'])('should remove (%s) quotes if given', (quote) => {
    expect(normalizeQuotes(`${quote}test${quote}`)).toBe('test');
  });
});

describe('getTextByProperty', () => {
  it.each(["'", '"', '`'])(
    'should return the property value and remove containing (%s) quotes',
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
