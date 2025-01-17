import { describe, expect } from 'vitest';
import { styleTransform } from './setup-compilation.ts';

describe('styleTransform', () => {
  it('should call scss.compileString and return the value of the css property', async () => {
    const code = `
      h1 {
        font-size: 40px;
        code {
          font-face: Roboto Mono;
        }
      }
    `;

    expect(await styleTransform(code)).toMatchInlineSnapshot(`
      "h1 {
        font-size: 40px;
      }
      h1 code {
        font-face: Roboto Mono;
      }"
    `);
  });
});
