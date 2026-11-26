import { vi } from 'vitest';
import { peakPlugin } from './revenue-chart.plugin';

const createCtx = () => ({
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 40 })),
});

const draw = (values: number[], hoveredIndex?: number, currency = 'EGP') => {
  const ctx = createCtx();
  const chart = {
    ctx,
    width: 300,
    chartArea: { left: 0, right: 300, top: 0, bottom: 200 },
    data: { datasets: [{ data: values }] },
    getActiveElements: () => (hoveredIndex === undefined ? [] : [{ index: hoveredIndex }]),
    getDatasetMeta: () => ({
      data: values.map((_, i) => ({ x: 50 + i * 100, y: 200 - values[i] })),
    }),
  };
  peakPlugin(currency).afterDatasetsDraw?.(
    chart as never,
    {} as never,
    {} as never,
    false,
  );
  return ctx;
};

describe('peakPlugin', () => {
  it('has a stable id', () => {
    expect(peakPlugin('EGP').id).toBe('peakHighlight');
  });

  it('labels the highest point when nothing is hovered', () => {
    const ctx = draw([10, 30, 20]);

    expect(ctx.fillText.mock.calls[0][0]).toBe('30 EGP');
    expect(ctx.fillText.mock.calls[0][1]).toBe(150);
  });

  it('labels the hovered point instead of the peak', () => {
    const ctx = draw([10, 30, 20], 0);

    expect(ctx.fillText.mock.calls[0][0]).toBe('10 EGP');
  });

  it('draws a separator between every pair of points', () => {
    const ctx = draw([10, 30, 20]);

    expect(ctx.stroke).toHaveBeenCalledTimes(2);
  });

  it('lightens the column behind the active point', () => {
    const ctx = draw([10, 30, 20]);

    expect(ctx.fillRect).toHaveBeenCalledTimes(1);
  });

  it('draws the white ring and the brand dot', () => {
    const ctx = draw([10, 30, 20]);

    expect(ctx.arc).toHaveBeenCalledTimes(2);
  });

  it('omits the currency spacing when there is no currency', () => {
    const ctx = draw([10, 30, 20], undefined, '');

    expect(ctx.fillText.mock.calls[0][0]).toBe('30');
  });

  it('draws nothing when there is no revenue and no hover', () => {
    const ctx = draw([0, 0, 0]);

    expect(ctx.fillText).not.toHaveBeenCalled();
    expect(ctx.arc).not.toHaveBeenCalled();
  });
});
