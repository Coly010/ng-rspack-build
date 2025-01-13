import { platform } from 'node:os';
import { ArrayLiteralExpression, PropertyAssignment } from 'ts-morph';

export const isUsingWindows = () => platform() === 'win32';

export function getTextByProperty(
  name: string,
  properties: PropertyAssignment[]
) {
  return properties
    .filter((property) => property.getName() === name)
    .map((property) => normalizeQuotes(property.getInitializer()?.getText()))
    .filter((url): url is string => url !== undefined);
}

export function getAllTextByProperty(
  name: string,
  properties: PropertyAssignment[]
) {
  return properties
    .filter((property) => property.getName() === name)
    .map((property) => property.getInitializer() as ArrayLiteralExpression)
    .flatMap((array) =>
      array.getElements().map((el) => normalizeQuotes(el.getText()))
    );
}

export function normalizeQuotes(str?: string) {
  return str ? str.replace(/['"`]/g, '') : str;
}
