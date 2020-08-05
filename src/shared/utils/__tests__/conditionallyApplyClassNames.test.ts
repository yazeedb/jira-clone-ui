import { conditionallyApplyClassNames } from '../conditionallyApplyClassNames';

describe('conditionallyApplyClassNames', () => {
  it('conditionally applies classNames', () => {
    const result = conditionallyApplyClassNames([
      ['class1', true],
      ['class2', false],
      ['class3', true],
      ['class4', false]
    ]);

    expect(result).toBe('class1 class3');
  });

  it('allows a base className', () => {
    const result = conditionallyApplyClassNames(
      [
        ['class1', true],
        ['class2', false],
        ['class3', true],
        ['class4', false]
      ],
      'my-base'
    );

    expect(result).toBe('my-base class1 class3');
  });
});
