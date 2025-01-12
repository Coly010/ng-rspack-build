import { ArrayLiteralExpression, PropertyAssignment } from 'ts-morph';

export function getTextByProperty(
  name: string,
  properties: PropertyAssignment[]
) {
  return properties
    .filter((property) => property.getName() === name)
    .map((property) =>
      property.getInitializer()?.getText().replace(/['"`]/g, '')
    )
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
      array.getElements().map((el) => el.getText().replace(/['"`]/g, ''))
    );
}
