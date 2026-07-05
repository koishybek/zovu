import { distanceMeters, specialistPassesFilters, ALMATY } from './geo';

describe('geo (ADR-005 фоллбэк)', () => {
  it('distanceMeters — корректная дистанция по Алматы (~5.4 км)', () => {
    const dostyk = { lat: 43.233333, lng: 76.956389 };
    const d = distanceMeters(ALMATY, dostyk);
    expect(d).toBeGreaterThan(5000);
    expect(d).toBeLessThan(6000);
  });
});

describe('specialistPassesFilters (Ф-02…Ф-05, Ф-07)', () => {
  const spec = { diplomaApproved: false, rating: 4.0, completedOrders: 10 };

  it('пустые фильтры → проходит', () => {
    expect(specialistPassesFilters({}, spec, 500)).toBe(true);
  });

  it('Ф-02 certifiedOnly: недипломированный НЕ проходит', () => {
    expect(specialistPassesFilters({ certifiedOnly: true }, spec, 500)).toBe(false);
    expect(specialistPassesFilters({ certifiedOnly: true }, { ...spec, diplomaApproved: true }, 500)).toBe(true);
  });

  it('Ф-03 minRating: рейтинг ниже порога НЕ проходит', () => {
    expect(specialistPassesFilters({ minRating: 4.5 }, spec, 500)).toBe(false);
    expect(specialistPassesFilters({ minRating: 4.0 }, spec, 500)).toBe(true);
  });

  it('Ф-04 minOrders: опыт ниже порога НЕ проходит', () => {
    expect(specialistPassesFilters({ minOrders: 20 }, spec, 500)).toBe(false);
    expect(specialistPassesFilters({ minOrders: 5 }, spec, 500)).toBe(true);
  });

  it('Ф-05 maxDistanceKm: дальше порога НЕ проходит', () => {
    expect(specialistPassesFilters({ maxDistanceKm: 1 }, spec, 2000)).toBe(false); // 2 км > 1 км
    expect(specialistPassesFilters({ maxDistanceKm: 5 }, spec, 2000)).toBe(true);
  });

  it('Ф-07: комбинация фильтров — любой непройденный отсекает', () => {
    const good = { diplomaApproved: true, rating: 5, completedOrders: 50 };
    const filters = { certifiedOnly: true, minRating: 4.5, minOrders: 20, maxDistanceKm: 10 };
    expect(specialistPassesFilters(filters, good, 3000)).toBe(true);
    expect(specialistPassesFilters(filters, { ...good, rating: 4.0 }, 3000)).toBe(false);
  });
});
