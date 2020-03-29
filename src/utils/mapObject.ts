type ValueOf<T> = T[keyof T];

export const mapObject = <OldObject, NewValue>(
  mappingFn: (value: ValueOf<OldObject>) => NewValue,
  obj: OldObject
): Record<keyof OldObject, NewValue> =>
  Object.keys(obj).reduce((newObj, key) => {
    // @ts-ignore (Not sure how to work around this)
    const oldValue = obj[key];

    // @ts-ignore (Not sure how to work around this)
    newObj[key] = mappingFn(oldValue);

    return newObj;
  }, {} as Record<keyof OldObject, NewValue>);
