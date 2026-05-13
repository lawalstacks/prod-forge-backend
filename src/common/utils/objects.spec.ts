import { isObject } from './objects';

describe('isObject', () => {
  describe('negative cases', () => {
    it('returns false for null', () => {
      expect(isObject(null)).toBe(false);
    });

    it('returns false for a string', () => {
      expect(isObject('hello')).toBe(false);
    });

    it('returns false for a number', () => {
      expect(isObject(42)).toBe(false);
    });

    it('returns false for a boolean', () => {
      expect(isObject(true)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isObject(undefined)).toBe(false);
    });
  });

  describe('positive cases', () => {
    it('returns true for a plain object', () => {
      expect(isObject({})).toBe(true);
    });

    it('returns true for an object with properties', () => {
      expect(isObject({ key: 'value' })).toBe(true);
    });

    it('returns true for an array', () => {
      expect(isObject([])).toBe(true);
    });

    it('returns true for a class instance', () => {
      expect(isObject(new Date())).toBe(true);
    });
  });
});
