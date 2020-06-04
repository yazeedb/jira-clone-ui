type QueryString = string | null | undefined;

type QueryObject = {
  [key: string]: string;
};

export const parseQuery = (queryString?: QueryString): QueryObject => {
  if (!queryString || !isValidQueryString(queryString)) {
    return {};
  }

  const sanitizedString = queryString.trim().replace(/^[?#&]/, '');

  const queryObject = {} as QueryObject;

  return sanitizedString
    .split('&')
    .map((pair) => pair.split('='))
    .reduce((acc, [key, value]) => {
      acc[key] = value;

      return acc;
    }, queryObject);
};

// Credit: https://stackoverflow.com/a/23959662/5924051
const isValidQueryString = (input: string) =>
  /^\?([\w-]+(=[\w-]*)?(&[\w-]+(=[\w-]*)?)*)?$/.test(input);
