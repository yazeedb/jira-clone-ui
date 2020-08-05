type ClassBoolPair = [string, boolean];

export const applyClassNames = (
  classBoolPairs: ClassBoolPair[],
  baseClassName = ''
) =>
  classBoolPairs
    .reduce(
      (name, [className, bool]) => (bool ? `${name} ${className}` : name),
      baseClassName
    )
    .trim();
