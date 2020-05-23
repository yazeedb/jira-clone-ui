import {
  validateKey,
  validateName,
  nameErrors,
  keyError
} from '../validateFields';

describe('validateName', () => {
  it('value must be 3 or more characters', () => {
    const output = [
      // Good
      'abc',
      '123',
      '@@@',

      // Bad
      '',
      'a',
      'ab'
    ].map(validateName);

    expect(output).toEqual([
      undefined,
      undefined,
      undefined,

      nameErrors.required,
      nameErrors.tooShort,
      nameErrors.tooShort
    ]);
  });
});

describe('validateKey', () => {
  it('value must start with uppercase letter', () => {
    const output = [
      // Good
      'AA',
      'B1',
      'D4',

      // Bad
      '',
      'a',
      'ab'
    ].map(validateKey);

    expect(output).toEqual([
      undefined,
      undefined,
      undefined,

      keyError,
      keyError,
      keyError
    ]);
  });

  it('followed by one or more uppercase alphanumeric characters', () => {
    const output = [
      // Good
      'AA',
      'B1',
      'D4',

      // Bad
      'A@',
      'aA',
      'Aa',
      '1',
      '1aAb',
      'zzzzzzZ'
    ].map(validateKey);

    expect(output).toEqual([
      undefined,
      undefined,
      undefined,

      keyError,
      keyError,
      keyError,
      keyError,
      keyError,
      keyError
    ]);
  });
});
