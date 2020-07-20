const hasLeadingZeros = (value: string) =>
  value.length > 1 && value.startsWith('0');

export const isValidColumnLimit = (limit?: string) => {
  if (!limit) {
    return false;
  }

  const is3Digits = /^\d{1,3}$/;

  if (!is3Digits.test(limit)) {
    return false;
  }

  if (hasLeadingZeros(limit)) {
    return false;
  }

  const limitNumber = parseInt(limit);

  return limitNumber >= 0 && limitNumber <= 999;
};

export const validationError = 'Enter a number between 0 and 999';

export const validateColumnLimit = (limit?: string) =>
  isValidColumnLimit(limit) ? undefined : validationError;
