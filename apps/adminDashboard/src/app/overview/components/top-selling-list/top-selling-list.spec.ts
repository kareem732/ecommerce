import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { TopSellingProduct } from '../../interfaces/overview.res';
import { TopSellingList } from './top-selling-list';

const PRODUCTS: TopSellingProduct[] = [
  { productId: 'p1', title: 'Romantic Red Roses', unitPrice: 24.3, totalSales: 96 },
  { productId: 'p2', title: 'White Lilies', unitPrice: 18, totalSales: 40 },
];

describe('TopSellingList', () => {
  let fixture: ComponentFixture<TopSellingList>;

  const rows = () =>
    Array.from(fixture.nativeElement.querySelectorAll('[data-testid="row"]')) as HTMLElement[];
  const cell = (row: HTMLElement, testId: string) =>
    row.querySelector(`[data-testid="${testId}"]`)?.textContent?.trim();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopSellingList],
      providers: [provideTranslateService()],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { 'ADMIN.OVERVIEW.SALES_COUNT': '{{count}} sales' });
    translate.use('en');

    fixture = TestBed.createComponent(TopSellingList);
    fixture.componentRef.setInput('products', PRODUCTS);
    fixture.componentRef.setInput('currency', 'EGP');
    fixture.detectChanges();
  });

  it('renders a row per product in order', () => {
    expect(rows().length).toBe(2);
    expect(cell(rows()[0], 'title')).toBe('Romantic Red Roses');
    expect(cell(rows()[1], 'title')).toBe('White Lilies');
  });

  it('renders the unit price with the currency', () => {
    expect(cell(rows()[0], 'price')).toBe('(24.3 EGP)');
    expect(cell(rows()[1], 'price')).toBe('(18 EGP)');
  });

  it('renders the sales count', () => {
    expect(cell(rows()[0], 'sales')).toBe('96 sales');
  });

  it('renders no rows for an empty list', () => {
    fixture.componentRef.setInput('products', []);
    fixture.detectChanges();

    expect(rows().length).toBe(0);
  });
});
