import { parseQuery } from '../parseQuery';

describe('parseQueryParams', () => {
  it('returns key/value pairs of a valid query string', () => {
    const output = parseQuery('?key=value&hello=world&regex=fun&jira=fun');

    expect(output).toEqual({
      key: 'value',
      hello: 'world',
      regex: 'fun',
      jira: 'fun'
    });
  });

  it('handles empty inputs', () => {
    const output = [null, undefined, ''].map(parseQuery);

    expect(output).toEqual([{}, {}, {}]);
  });

  it('validates input format', () => {
    const output = [
      '"?"[key"="value"&"]+',
      '?""[]badinput{}{}NaN',
      '24344'
    ].map(parseQuery);

    expect(output).toEqual([{}, {}, {}]);
  });
});
