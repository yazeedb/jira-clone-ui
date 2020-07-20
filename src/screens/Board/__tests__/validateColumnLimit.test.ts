import { validateColumnLimit, validationError } from '../validateColumnLimit';

describe('validateColumnLimit', () => {
  it('allows 0 to 999, no whitespace or leading zeros', () => {
    const zeroTo999 = Array.from({ length: 1000 }, (_, index) =>
      index.toString()
    );

    const valid = zeroTo999.every((v) => validateColumnLimit(v) === undefined);

    expect(valid).toBe(true);
  });

  it('denies all other values', () => {
    const allInvalid = [
      '000',
      '099',
      '1000',
      ' 0 ',
      ' 999 ',
      '-1',
      'abc',
      '',
      null,
      undefined,
      {},
      [],
      NaN
      // Ignore TypeScript compiler
      // to allow testing weird values
      // @ts-ignore
    ].every((v) => validateColumnLimit(v) === validationError);

    expect(allInvalid).toBe(true);
  });
});
