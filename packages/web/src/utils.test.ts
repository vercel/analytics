import { parseProperties } from './utils';

describe('utils', () => {
  describe('parse properties, strip (production)', () => {
    it('all allowed', () => {
      const properties = {
        all: true,
        should: 'pass',
        are: true,
        is: null,
      };

      expect(properties).toEqual(parseProperties(properties, { strip: true }));
    });

    it('dismiss array and object', () => {
      const properties = {
        some: 'string',
        array: [],
        object: {},
      };

      expect({
        some: 'string',
      }).toEqual(parseProperties(properties, { strip: true }));
    });
  });

  describe('parse properties, log', () => {
    it('all allowed', () => {
      const properties = {
        all: true,
        should: 'pass',
        are: true,
        is: null,
      };

      expect(properties).toEqual(
        parseProperties(properties, {
          strip: false,
        }),
      );
    });
    it('dismiss array and object', () => {
      const properties = {
        some: 'string',
        arrayProp: [],
        objectProp: {},
      };

      expect(() => {
        parseProperties(properties, { strip: false });
      }).toThrow(/arrayProp, objectProp/);
    });
  });
});
