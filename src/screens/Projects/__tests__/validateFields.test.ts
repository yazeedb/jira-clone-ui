import {
  validateKey,
  validateName,
  nameErrors,
  keyError
} from '../validateFields';

describe('validateName', () => {
  it('value must be between 3 and 80 characters', () => {
    const output = [
      // Good
      'abc',
      '123',
      '@@@',
      ''.padEnd(80, 'hello'),

      // Bad
      '',
      'a',
      'ab',
      ''.padEnd(83, 'hello'),
    ].map(validateName);

    expect(output).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,

      nameErrors.required,
      nameErrors.tooShort,
      nameErrors.tooShort,
      nameErrors.tooLong
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
