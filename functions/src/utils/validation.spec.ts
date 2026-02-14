import { validateRequiredParam, validateNumberParam, validateOptionalNumberParam, validateStringParam } from './validation';
import { ValidationError } from './error-handler';

describe('validateRequiredParam', () => {
  it('should return value when present', () => {
    expect(validateRequiredParam({ name: 'test' }, 'name')).toBe('test');
  });

  it('should throw ValidationError when missing', () => {
    expect(() => validateRequiredParam({}, 'name')).toThrow(ValidationError);
  });

  it('should throw for null', () => {
    expect(() => validateRequiredParam({ name: null }, 'name')).toThrow(ValidationError);
  });

  it('should throw for empty string', () => {
    expect(() => validateRequiredParam({ name: '' }, 'name')).toThrow(ValidationError);
  });
});

describe('validateNumberParam', () => {
  it('should return number when valid', () => {
    expect(validateNumberParam({ count: '42' }, 'count')).toBe(42);
  });

  it('should throw when not a number', () => {
    expect(() => validateNumberParam({ count: 'abc' }, 'count')).toThrow(ValidationError);
  });

  it('should throw when below min', () => {
    expect(() => validateNumberParam({ count: '0' }, 'count', 1)).toThrow(ValidationError);
  });

  it('should throw when above max', () => {
    expect(() => validateNumberParam({ count: '100' }, 'count', undefined, 50)).toThrow(ValidationError);
  });
});

describe('validateOptionalNumberParam', () => {
  it('should return undefined when missing', () => {
    expect(validateOptionalNumberParam({}, 'count')).toBeUndefined();
  });

  it('should return number when valid', () => {
    expect(validateOptionalNumberParam({ count: '10' }, 'count')).toBe(10);
  });
});

describe('validateStringParam', () => {
  it('should return string when valid', () => {
    expect(validateStringParam({ type: 'drivers' }, 'type', ['drivers', 'constructors'])).toBe('drivers');
  });

  it('should throw for invalid enum value', () => {
    expect(() => validateStringParam({ type: 'invalid' }, 'type', ['drivers', 'constructors'])).toThrow(ValidationError);
  });
});
