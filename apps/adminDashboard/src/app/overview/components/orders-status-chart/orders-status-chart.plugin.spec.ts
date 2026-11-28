import { vi } from 'vitest';
import { percentBadges } from './orders-status-chart.plugin';

const createCtx = () => ({
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  fillText: vi.fn(),
});

const arc = (startAngle: number, endAngle: number) => ({
  startAngle,
  endAngle,
  x: 100,
  y: 100,
  outerRadius: 80,
});

const draw = (values: number[], ctx = createCtx()) => {
  const chart = {
    ctx,
    width: 200,
    height: 200,
    data: { datasets: [{ data: values }] },
    getDatasetMeta: () => ({ data: values.map((_, i) => arc(i, i + 1)) }),
  };
  percentBadges.afterDatasetsDraw?.(
    chart as never,
    {} as never,
    {} as never,
    false,
  );
  return ctx;
};

describe('percentBadges plugin', () => {
  it('has a stable id', () => {
    expect(percentBadges.id).toBe('percentBadges');
  });

  it('draws one badge per non-zero segment', () => {
    const ctx = draw([50, 0, 50]);

    expect(ctx.arc).toHaveBeenCalledTimes(2);
    expect(ctx.fillText).toHaveBeenCalledTimes(2);
  });

  it('writes the rounded percent inside the badge', () => {
    const ctx = draw([33.333]);

    expect(ctx.fillText.mock.calls[0][0]).toBe('33.3%');
  });

  it('keeps the badge inside the canvas', () => {
    const ctx = draw([100]);

    const [x, y] = ctx.arc.mock.calls[0];
    expect(x).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThanOrEqual(200);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(y).toBeLessThanOrEqual(200);
  });

  it('draws nothing when every segment is zero', () => {
    const ctx = draw([0, 0, 0]);

    expect(ctx.fillText).not.toHaveBeenCalled();
  });
});
