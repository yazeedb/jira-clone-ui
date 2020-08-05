type ClassBoolPair = [string, boolean];

export const conditionallyApplyClassNames = (
  classBoolPairs: ClassBoolPair[],
  baseClassName = ''
) =>
  classBoolPairs
    .reduce(
      (name, [className, bool]) => (bool ? `${name} ${className}` : name),
      baseClassName
    )
    .trim();
