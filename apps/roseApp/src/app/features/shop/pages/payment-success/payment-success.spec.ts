import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  provideTranslateTesting,
  useEnglish,
} from '../../../../shared/utils/testing/translate.testing';
import { PaymentSuccess } from './payment-success';

describe('PaymentSuccess', () => {
  let fixture: ComponentFixture<PaymentSuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentSuccess],
      providers: [provideRouter([]), provideTranslateTesting()],
    }).compileComponents();
    useEnglish();

    fixture = TestBed.createComponent(PaymentSuccess);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the success message and a link back to the shop', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Payment Successful');
    expect(element.querySelector('a[href="/shop/home"]')).toBeTruthy();
  });
});
