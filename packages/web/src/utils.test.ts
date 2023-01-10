import { parseProperties } from './utils';

describe('utils', () => {
  describe('parse properties', () => {
    describe('strip', () => {
      it('should allow all properties', () => {
        const properties = {
          number: 10,
          string: 'some-string',
          boolean: true,
          nullable: null,
        };

        const parsed = parseProperties(properties, { strip: true });

        expect(properties).toEqual(parsed);
      });

      it('should dismiss array and object', () => {
        const properties = {
          string: 'some-string',
          array: [],
          object: {},
        };

        const parsed = parseProperties(properties, { strip: true });

        expect({
          string: 'some-string',
        }).toEqual(parsed);
      });
    });

    describe('throw error', () => {
      it('should allow all properties', () => {
        const properties = {
          number: 10,
          string: 'some-string',
          boolean: true,
          nullable: null,
        };
        const parsed = parseProperties(properties, {
          strip: false,
        });

        expect(properties).toEqual(parsed);
      });

      it('should throw an error for arrayProp and objectProp', () => {
        const properties = {
          string: 'some-string',
          arrayProp: [],
          objectProp: {},
        };

        expect(() => {
          parseProperties(properties, { strip: false });
        }).toThrow(/arrayProp, objectProp/);
      });
    });
  });
});
