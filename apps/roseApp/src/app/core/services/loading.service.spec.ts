import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingService],
    });
    service = TestBed.inject(LoadingService);
  });

  it('has inactive initial loading state', () => {
    expect(service.isLoading()).toBe(false);
    expect(service.count()).toBe(0);
  });

  it('activates loading when starting a request', () => {
    service.start();
    expect(service.isLoading()).toBe(true);
    expect(service.count()).toBe(1);
  });

  it('deactivates loading when finishing the last request', () => {
    service.start();
    expect(service.isLoading()).toBe(true);

    service.stop();
    expect(service.isLoading()).toBe(false);
    expect(service.count()).toBe(0);
  });

  it('keeps loading active during concurrent overlapping requests until all finish', () => {
    // Request A starts
    service.start();
    expect(service.isLoading()).toBe(true);
    expect(service.count()).toBe(1);

    // Request B starts
    service.start();
    expect(service.isLoading()).toBe(true);
    expect(service.count()).toBe(2);

    // Request A finishes, Request B still active
    service.stop();
    expect(service.isLoading()).toBe(true);
    expect(service.count()).toBe(1);

    // Request B finishes
    service.stop();
    expect(service.isLoading()).toBe(false);
    expect(service.count()).toBe(0);
  });

  it('prevents count from becoming negative or stuck on repeated cleanup calls', () => {
    expect(service.count()).toBe(0);

    // Multiple stops on empty queue
    service.stop();
    service.stop();
    expect(service.count()).toBe(0);
    expect(service.isLoading()).toBe(false);

    // Normal request followed by excess stops
    service.start();
    expect(service.count()).toBe(1);
    service.stop();
    service.stop();
    expect(service.count()).toBe(0);
    expect(service.isLoading()).toBe(false);
  });

  it('resets loading state completely when reset is invoked', () => {
    service.start();
    service.start();
    expect(service.count()).toBe(2);

    service.reset();
    expect(service.count()).toBe(0);
    expect(service.isLoading()).toBe(false);
  });
});
