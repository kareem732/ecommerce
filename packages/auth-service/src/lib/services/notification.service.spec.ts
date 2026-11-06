import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  const messages = () => service.toasts().map((t) => t.message);

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds a toast with the default duration of its severity', () => {
    service.success('done');
    service.error('failed');

    const [success, error] = service.toasts();
    expect(success).toMatchObject({ severity: 'success', duration: 3500, count: 1 });
    expect(error).toMatchObject({ severity: 'error', duration: 6000, count: 1 });
  });

  it('merges an identical toast into one and counts it', () => {
    service.error('failed');
    service.error('failed');
    service.error('failed');

    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0].count).toBe(3);
  });

  it('keeps toasts with different messages, severities or params apart', () => {
    service.error('failed');
    service.success('failed');
    service.error('failed', { id: 1 });

    expect(service.toasts()).toHaveLength(3);
  });

  it('shows at most 3 toasts and drops the oldest first', () => {
    ['a', 'b', 'c', 'd'].forEach((m) => service.info(m));

    expect(messages()).toEqual(['b', 'c', 'd']);
  });

  it('dismisses a toast after its duration', () => {
    service.success('done');

    vi.advanceTimersByTime(3499);
    expect(service.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(service.toasts()).toHaveLength(0);
  });

  it('restarts the timer when the same toast is raised again', () => {
    service.error('failed');
    vi.advanceTimersByTime(5000);

    service.error('failed');
    vi.advanceTimersByTime(5000);
    expect(service.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(1000);
    expect(service.toasts()).toHaveLength(0);
  });

  it('bumps the version when the same toast is raised again', () => {
    service.error('failed');
    service.error('failed');

    expect(service.toasts()[0].version).toBe(1);
  });

  it('stays while paused and continues with the remaining time on resume', () => {
    service.success('done');
    const id = service.toasts()[0].id;

    vi.advanceTimersByTime(2000);
    service.pause(id);
    vi.advanceTimersByTime(60_000);
    expect(service.toasts()).toHaveLength(1);

    service.resume(id);
    vi.advanceTimersByTime(1499);
    expect(service.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(service.toasts()).toHaveLength(0);
  });

  it('never auto-dismisses a toast with duration 0', () => {
    service.show('sticky', 'info', 0);

    vi.advanceTimersByTime(60_000);

    expect(service.toasts()).toHaveLength(1);
  });

  it('dismisses a toast manually and clears everything', () => {
    service.info('a');
    service.info('b');

    service.dismiss(service.toasts()[0].id);
    expect(messages()).toEqual(['b']);

    service.clear();
    expect(service.toasts()).toEqual([]);
  });
});
