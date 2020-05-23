export const nameErrors = {
  required: 'Your new project needs a name',
  tooShort: 'The project name is too short',
  tooLong: 'The project name is too long'
};

export const validateName = (name?: string) => {
  if (!name) {
    return nameErrors.required;
  }

  if (name.length < 3) {
    return nameErrors.tooShort;
  }

  if (name.length > 80) {
    return nameErrors.tooLong;
  }

  return undefined;
};

export const keyErrors = {
  required: 'Project key is required.',
  tooLong: 'The project key must not exceed 10 characters in length.',
  general: 'Project keys must start with an uppercase letter, followed by one or more uppercase alphanumeric characters.'
}

export const validateKey = (key?: string) => {
  if (!key) {
    return keyErrors.required;
  }

  const [firstCharacter, ...restOfString] = key;
  const firstLetterCapital = /[A-Z]/.test(firstCharacter);

  if (!firstLetterCapital) {
    return keyErrors.general;
  }

  const isAlphanumeric = (v: string) => /\w/.test(v);
  const isCapitalAlphanumeric = (v: string) =>
    isAlphanumeric(v) && v.toUpperCase() === v;

  if (!restOfString.every(isAlphanumeric)) {
    return keyErrors.general;
  }

  if (!restOfString.some(isCapitalAlphanumeric)) {
    return keyErrors.general;
  }

  if (key.length > 10) {
    return keyErrors.tooLong;
  }
};
