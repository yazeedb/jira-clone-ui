type ValueOf<T> = T[keyof T];

export const mapObject = <OldObject extends object, NewValue>(
  mappingFn: (value: ValueOf<OldObject>) => NewValue,
  obj: OldObject
): Record<keyof OldObject, NewValue> => {
  const newObj = {} as Record<keyof OldObject, NewValue>;

  for (let i in obj) {
    if (obj.hasOwnProperty(i)) {
      const oldValue = obj[i];
      newObj[i] = mappingFn(oldValue);
    }
  }

  return newObj;
};
