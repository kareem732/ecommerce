import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  provideTranslateTesting,
  useEnglish,
} from '../../../../shared/utils/testing/translate.testing';
import { PaymentCancel } from './payment-cancel';

describe('PaymentCancel', () => {
  let fixture: ComponentFixture<PaymentCancel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentCancel],
      providers: [provideRouter([]), provideTranslateTesting()],
    }).compileComponents();
    useEnglish();

    fixture = TestBed.createComponent(PaymentCancel);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the cancel message with retry and back-to-cart links', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Payment Cancelled');
    expect(element.querySelector('a[href="/shop/cart/payment"]')).toBeTruthy();
    expect(element.querySelector('a[href="/shop/cart"]')).toBeTruthy();
  });
});
