import { OVERVIEW_PAYLOAD } from './testing/overview.fixture';
import { buildStats } from './overview.stats';

describe('buildStats', () => {
  const stats = buildStats(OVERVIEW_PAYLOAD.summary);

  it('builds the four stats in order', () => {
    expect(stats.map((stat) => stat.key)).toEqual([
      'products',
      'orders',
      'categories',
      'revenue',
    ]);
  });

  it('maps the summary values', () => {
    expect(stats.map((stat) => stat.value)).toEqual([98, 620, 27, 4500]);
  });

  it('adds the currency suffix to revenue only', () => {
    expect(stats.map((stat) => stat.suffix)).toEqual(['', '', '', 'EGP']);
  });

  it('uses translation keys as labels', () => {
    stats.forEach((stat) => expect(stat.label).toMatch(/^ADMIN\.OVERVIEW\./));
  });
});
