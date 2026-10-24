import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrustedCompanies } from './trusted-companies';

describe('TrustedCompanies', () => {
  let component: TrustedCompanies;
  let fixture: ComponentFixture<TrustedCompanies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrustedCompanies],
    }).compileComponents();

    fixture = TestBed.createComponent(TrustedCompanies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
