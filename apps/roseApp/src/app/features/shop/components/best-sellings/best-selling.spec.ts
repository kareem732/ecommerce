import { makeTestimonialsResponse } from './../../../../shared/utils/testing/testimonial.fixtures';
import { NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, contentChild, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BestSelling } from './best-selling';
import { Product } from '../../interfaces/home.model/home-model-response';
import { makeOccasionsResponse,makeProduct,makeProductsResponse} from '../../../../shared/utils/testing/product.fixtures';
import { provideTranslateTesting, useEnglish } from '../../../../shared/utils/testing/translate.testing';
import { ProductsQuery } from '../../interfaces/home.model/home-model-request';
import { ShopService } from '../../services/shop.service';
import { HomeStore } from '../../stores/home/home.store';
import { Carousel } from '../carousel/carousel';
import { ProductSortBy, SortOrder } from '../../enums/product-sort';

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

describe('BestSelling', () => {
  const products = [
    makeProduct({ id: 'a', title: 'First Bouquet' }),
    makeProduct({ id: 'b', title: 'Second Bouquet' }),
  ];

  let fixture: ComponentFixture<BestSelling>;
  let element: HTMLElement;
  let queries: ProductsQuery[];

  beforeEach(async () => {
    queries = [];

    const shopServiceStub = {
      getProducts: (query?: ProductsQuery) => {
        queries.push(query ?? {});
        return of(makeProductsResponse(products));
      },
      getOccasions: () => of(makeOccasionsResponse([])),
      getTestimonials: () => of(makeTestimonialsResponse([])),
    };

    await TestBed.configureTestingModule({
      imports: [BestSelling],
      providers: [
        HomeStore,
        { provide: ShopService, useValue: shopServiceStub },
        provideRouter([]),
        provideTranslateTesting(),
      ],
    })
      .overrideComponent(BestSelling, {
        remove: { imports: [Carousel] },
        add: { imports: [CarouselStub] },
      })
      .compileComponents();
    useEnglish();

    fixture = TestBed.createComponent(BestSelling);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('requests the 10 best selling products', () => {
    const bestSelling = queries.filter((query) => query.sortBy === ProductSortBy.BEST_SELLING);

    expect(bestSelling).toEqual([
      { page: 1, limit: 10, sortBy: ProductSortBy.BEST_SELLING, sortOrder: SortOrder.DESC },
    ]);
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
    expect(element.querySelector('.best-selling__eyebrow')?.textContent?.trim()).toBe(
      'Best Selling',
    );
  });

  it('renders the translated headline', () => {
    const title = element.querySelector('.best-selling__title')?.textContent;

    expect(title?.replace(/\s+/g, ' ').trim()).toBe(
      'Check Out What Everyone’s Buying Right Now',
    );
  });

  it('links the call to action to the products page', () => {
    const cta = element.querySelector('.best-selling__cta') as HTMLAnchorElement;

    expect(cta.textContent).toContain('Explore gifts');
    expect(cta.getAttribute('href')).toBe('/shop/products');
  });
});
