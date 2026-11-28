import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { OverviewCategory } from '../../interfaces/overview.res';
import { CategoriesList } from './categories-list';

describe('CategoriesList', () => {
  let fixture: ComponentFixture<CategoriesList>;

  const rows = () =>
    Array.from(fixture.nativeElement.querySelectorAll('[data-testid="row"]')) as HTMLElement[];

  const render = (categories: OverviewCategory[]) => {
    fixture.componentRef.setInput('categories', categories);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesList],
      providers: [provideTranslateService()],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { 'ADMIN.OVERVIEW.PRODUCTS_COUNT': '{{count}} products' });
    translate.use('en');

    fixture = TestBed.createComponent(CategoriesList);
  });

  it('renders a row per category', () => {
    render([
      { id: 'c1', title: 'Roses', productCount: 11 },
      { id: 'c2', title: 'Tulips', productCount: 4 },
    ]);

    expect(rows().length).toBe(2);
  });

  it('renders the title and the product count', () => {
    render([{ id: 'c1', title: 'Roses', productCount: 11 }]);

    const [row] = rows();
    expect(row.querySelector('[data-testid="title"]')?.textContent?.trim()).toBe('Roses');
    expect(row.querySelector('[data-testid="count"]')?.textContent?.trim()).toBe('11 products');
  });

  it('renders no rows for an empty list', () => {
    render([]);

    expect(rows().length).toBe(0);
  });
});
