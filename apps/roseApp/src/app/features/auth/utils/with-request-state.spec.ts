import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signalStore } from '@ngrx/signals';
import { Subject, of, throwError } from 'rxjs';
import { toErrorMessage, withRequestState } from './with-request-state';

const TestStore = signalStore({ providedIn: 'root' }, withRequestState());

describe('withRequestState', () => {
  beforeEach(() => TestBed.resetTestingModule());

  const create = () => TestBed.inject(TestStore);

  it('starts idle with no error', () => {
    const store = create();

    expect(store.status()).toBe('idle');
    expect(store.error()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.succeeded()).toBe(false);
  });

  it('is pending until the source emits, then succeeds', () => {
    const store = create();
    const source$ = new Subject<string>();
    const values: string[] = [];

    store.track(source$).subscribe((v) => values.push(v));
    expect(store.loading()).toBe(true);

    source$.next('done');

    expect(values).toEqual(['done']);
    expect(store.loading()).toBe(false);
    expect(store.succeeded()).toBe(true);
  });

  it('does nothing until subscribed', () => {
    const store = create();

    store.track(of(1));

    expect(store.status()).toBe('idle');
  });

  it('stores the error message and swallows the error', () => {
    const store = create();
    const onError = vi.fn();
    const onComplete = vi.fn();

    store
      .track(throwError(() => ({ code: 'X', status: 500, message: 'Boom' })))
      .subscribe({ error: onError, complete: onComplete });

    expect(store.status()).toBe('error');
    expect(store.error()).toBe('Boom');
    expect(store.loading()).toBe(false);
    expect(onError).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
  });

  it('clears a previous error when a new request starts', () => {
    const store = create();
    store.track(throwError(() => ({ message: 'Boom' }))).subscribe();

    store.track(new Subject<string>()).subscribe();

    expect(store.error()).toBeNull();
    expect(store.loading()).toBe(true);
  });

  it('clearError goes back to idle', () => {
    const store = create();
    store.track(throwError(() => ({ message: 'Boom' }))).subscribe();

    store.clearError();

    expect(store.status()).toBe('idle');
    expect(store.error()).toBeNull();
  });

  describe('toErrorMessage', () => {
    it('reads message from error-like objects', () => {
      expect(toErrorMessage(new Error('Oops'))).toBe('Oops');
      expect(toErrorMessage({ message: 'Nope' })).toBe('Nope');
    });

    it('falls back for anything else', () => {
      const fallback = 'Something went wrong.';

      expect(toErrorMessage('str')).toBe(fallback);
      expect(toErrorMessage(null)).toBe(fallback);
      expect(toErrorMessage({ message: 42 })).toBe(fallback);
    });
  });
});