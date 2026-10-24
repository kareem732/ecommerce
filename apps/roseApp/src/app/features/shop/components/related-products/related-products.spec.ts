import { NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, contentChild, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProductSortBy, SortOrder } from '../../enums/product-sort';
import { ProductsQuery } from '../../interfaces/home.model/home-model-request';
import { Product } from '../../interfaces/home.model/home-model-response';
import { ShopService } from '../../services/shop.service';
import { Carousel } from '../carousel/carousel';
import {
  makeProduct,
  makeProductsResponse,
} from '../../../../shared/utils/testing/product.fixtures';
import {
  provideTranslateTesting,
  useEnglish,
} from '../../../../shared/utils/testing/translate.testing';
import { RelatedProducts } from './related-products';

@Component({
  selector: 'app-carousel',
  imports: [NgTemplateOutlet],
  template: `
    @for (item of items(); track item.id) {
      <ng-container *ngTemplateOutlet="itemTemplate(); context: { $implicit: item }" />
    }
  `,
})
class CarouselStub {
  readonly items = input.required<Product[]>();
  readonly numVisible = input<number>(3);
  readonly itemTemplate =
    contentChild.required<TemplateRef<{ $implicit: Product }>>('itemTemplate');
}

describe('RelatedProducts', () => {
  const products = [
    makeProduct({ id: 'a', title: 'First Bouquet' }),
    makeProduct({ id: 'b', title: 'Second Bouquet' }),
  ];

  let fixture: ComponentFixture<RelatedProducts>;
  let element: HTMLElement;
  let lastQuery: ProductsQuery | undefined;

  beforeEach(async () => {
    lastQuery = undefined;

    const shopServiceStub = {
      getProducts: (query?: ProductsQuery) => {
        lastQuery = query;
        return of(makeProductsResponse(products));
      },
    };

    await TestBed.configureTestingModule({
      imports: [RelatedProducts],
      providers: [
        { provide: ShopService, useValue: shopServiceStub },
        provideTranslateTesting(),
      ],
    })
      .overrideComponent(RelatedProducts, {
        remove: { imports: [Carousel] },
        add: { imports: [CarouselStub] },
      })
      .compileComponents();
    useEnglish();

    fixture = TestBed.createComponent(RelatedProducts);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('requests the products', () => {
    expect(lastQuery).toEqual({
      page: 1,
      limit: 10,
      sortBy: ProductSortBy.BEST_SELLING,
      sortOrder: SortOrder.DESC,
    });
  });

  it('renders a product card for every product', () => {
    const cards = element.querySelectorAll('app-product-card');
    const titles = Array.from(element.querySelectorAll('.product__title')).map((el) =>
      el.textContent?.trim(),
    );

    expect(cards).toHaveLength(2);
    expect(titles).toEqual(['First Bouquet', 'Second Bouquet']);
  });

  it('renders the section title', () => {
    expect(
      element.querySelector('app-section-title')?.textContent?.replace(/\s+/g, ' ').trim(),
    ).toBe('Related Products');
  });
});
