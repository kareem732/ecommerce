import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { LowStockProduct } from '../../interfaces/overview.res';
import { LowStockList } from './low-stock-list';

describe('LowStockList', () => {
  let fixture: ComponentFixture<LowStockList>;

  const rows = () =>
    Array.from(fixture.nativeElement.querySelectorAll('[data-testid="row"]')) as HTMLElement[];

  const render = (products: LowStockProduct[]) => {
    fixture.componentRef.setInput('products', products);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LowStockList],
      providers: [provideTranslateService()],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { 'ADMIN.OVERVIEW.PRODUCTS_COUNT': '{{count}} left' });
    translate.use('en');

    fixture = TestBed.createComponent(LowStockList);
  });

  it('renders a row per product with title and stock', () => {
    render([
      { id: 'l1', title: 'mega bouquet', stock: 2 },
      { id: 'l2', title: 'mini bouquet', stock: 9 },
    ]);

    expect(rows().length).toBe(2);
    expect(rows()[0].querySelector('[data-testid="title"]')?.textContent?.trim()).toBe(
      'mega bouquet',
    );
    expect(rows()[0].querySelector('[data-testid="stock"]')?.textContent?.trim()).toBe('2 left');
  });

  it('highlights critical stock', () => {
    render([{ id: 'l1', title: 'mega bouquet', stock: 5 }]);

    expect(rows()[0].querySelector('[data-testid="stock"]')?.className).toContain('text-red-600');
  });

  it('keeps the normal tone above the critical threshold', () => {
    render([{ id: 'l1', title: 'mega bouquet', stock: 6 }]);

    const stock = rows()[0].querySelector('[data-testid="stock"]');
    expect(stock?.className).not.toContain('text-red-600');
    expect(stock?.className).toContain('text-[#27272A]');
  });

  it('renders no rows for an empty list', () => {
    render([]);

    expect(rows().length).toBe(0);
  });
});
