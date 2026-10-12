import { TestBed } from '@angular/core/testing';

import { RegisterData } from './register-data';

describe('RegisterData', () => {
  let service: RegisterData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegisterData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
