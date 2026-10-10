import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgetPasswordForm } from './forget-password-form';

describe('ForgetPasswordForm', () => {
  let component: ForgetPasswordForm;
  let fixture: ComponentFixture<ForgetPasswordForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgetPasswordForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgetPasswordForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
