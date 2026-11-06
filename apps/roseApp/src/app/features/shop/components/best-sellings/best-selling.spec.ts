import { NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, contentChild, input, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProductSortBy, SortOrder } from '../../enums/product-sort';
import { ProductsQuery } from '../../interfaces/home.model/home-model-request';
import { Product } from '../../interfaces/home.model/home-model-response';
import { ShopService } from '../../services/shop.service';
import { CartStore } from '../../stores/cart/cart.store';
import { HomeStore } from '../../stores/home/home.store';
import { WishlistStore } from '../../stores/wishlist/wishlist.store';
import {
  makeOccasionsResponse,
  makeProduct,
  makeProductsResponse,
} from '../../../../shared/utils/testing/product.fixtures';
import { makeTestimonialsResponse } from '../../../../shared/utils/testing/testimonial.fixtures';
import {
  provideTranslateTesting,
  useEnglish,
} from '../../../../shared/utils/testing/translate.testing';
import { Carousel } from '../carousel/carousel';
import { BestSelling } from './best-selling';

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
  let cartAdd: ReturnType<typeof vi.fn>;
  let wishlistToggle: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    queries = [];
    cartAdd = vi.fn();
    wishlistToggle = vi.fn();

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
        { provide: CartStore, useValue: { add: cartAdd } },
        {
          provide: WishlistStore,
          useValue: { ids: signal(new Set<string>()), toggle: wishlistToggle },
        },
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

  it('adds the product to the cart when a card emits addToCart', () => {
    const card = fixture.debugElement.query((node) => node.name === 'app-product-card');

    card.triggerEventHandler('addToCart', products[0]);

    expect(cartAdd).toHaveBeenCalledWith('a');
  });

  it('toggles the wishlist when a card emits addToWishlist', () => {
    const card = fixture.debugElement.query((node) => node.name === 'app-product-card');

    card.triggerEventHandler('addToWishlist', products[0]);

    expect(wishlistToggle).toHaveBeenCalledWith('a');
  });
});
