import { isValidKzPhone, normalizeKzPhone } from './phone';

describe('normalizeKzPhone', () => {
  it('нормализует разные форматы КЗ-номера в +7XXXXXXXXXX', () => {
    expect(normalizeKzPhone('+7 701 234 56 78')).toBe('+77012345678');
    expect(normalizeKzPhone('87012345678')).toBe('+77012345678');
    expect(normalizeKzPhone('77012345678')).toBe('+77012345678');
    expect(normalizeKzPhone('7012345678')).toBe('+77012345678');
  });

  it('бросает на невалидном номере', () => {
    expect(() => normalizeKzPhone('123')).toThrow('invalid_kz_phone');
    expect(() => normalizeKzPhone('+1 555 000 1111')).toThrow();
    expect(isValidKzPhone('abc')).toBe(false);
    expect(isValidKzPhone('+77012345678')).toBe(true);
  });
});
