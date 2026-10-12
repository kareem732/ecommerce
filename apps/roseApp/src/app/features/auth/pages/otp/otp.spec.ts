import { ComponentFixture, TestBed } from '@angular/core/testing';
import { otp } from './otp';

describe('otp', () => {
  let component: otp;
  let fixture: ComponentFixture<otp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [otp],
    }).compileComponents();

    fixture = TestBed.createComponent(otp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
