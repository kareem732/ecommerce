import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, vi } from 'vitest';
import { makeProduct } from '../../../../shared/utils/testing/product.fixtures';
import {
  provideTranslateTesting,
  useEnglish,
} from '../../../../shared/utils/testing/translate.testing';
import { ProductReviews } from '../../../shop/components/product-reviews/product-reviews';
import { ProductResponse } from '../../../shop/interfaces/home.model/home-model-response';
import { ProductsService } from '../../services/products.service';
import { ProductDetails } from './product-details';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  template: '',
})
class ProductReviewsStub {
  readonly productId = input<string>();
}

describe('ProductDetails', () => {
  let fixture: ComponentFixture<ProductDetails>;
  let component: ProductDetails;
  let element: HTMLElement;
  let getProductMock: ReturnType<typeof vi.fn>;

  const sampleProduct = makeProduct({
    id: 'prod-123',
    title: 'Dreamy White Roses Bouquet',
    description:
      'Elevate any celebration with our luxury rose bouquet. This exquisite arrangement features pristine white roses.',
    price: '199.50',
    stock: 265,
    rating: 4.5,
    ratings: 8,
    cover: 'https://example.com/cover.jpg',
    gallery: JSON.stringify([
      'https://example.com/img1.jpg',
      'https://example.com/img2.jpg',
    ]),
  });

  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const setup = async (
    routeId: string | null = 'prod-123',
    productResult = of({
      status: true,
      code: 200,
      payload: { product: sampleProduct },
    } as ProductResponse),
  ) => {
    getProductMock = vi.fn().mockReturnValue(productResult);

    await TestBed.configureTestingModule({
      imports: [ProductDetails],
      providers: [
        provideTranslateTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(routeId ? { id: routeId } : {}),
            },
            paramMap: of(convertToParamMap(routeId ? { id: routeId } : {})),
          },
        },
        {
          provide: ProductsService,
          useValue: {
            getProduct: getProductMock,
          },
        },
      ],
    })
      .overrideComponent(ProductDetails, {
        remove: { imports: [ProductReviews] },
        add: { imports: [ProductReviewsStub] },
      })
      .compileComponents();
    useEnglish();

    fixture = TestBed.createComponent(ProductDetails);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    await settle();
  };

  it('creates the component and extracts route product ID', async () => {
    await setup('prod-123');
    expect(component).toBeTruthy();
    expect(component.resolvedProductId()).toBe('prod-123');
    expect(getProductMock).toHaveBeenCalledWith('prod-123');
  });

  it('handles missing route ID gracefully by setting missing-id state', async () => {
    await setup(null);
    expect(component.status()).toBe('missing-id');
    expect(getProductMock).not.toHaveBeenCalled();
  });

  it('renders product title, stock, rating, and description on success', async () => {
    await setup('prod-123');

    const titleEl = element.querySelector('#product-title');
    expect(titleEl?.textContent?.trim()).toBe('Dreamy White Roses Bouquet');

    const stockPill = element.querySelector('.stock-pill');
    expect(stockPill?.textContent).toContain('265 left in stock');

    expect(element.textContent).toContain('Rating: 4.5/5');
    expect(element.textContent).toContain('(8 ratings)');

    expect(element.textContent).toContain(
      'Elevate any celebration with our luxury rose bouquet',
    );
  });

  it('renders backend price directly without frontend discount recalculation', async () => {
    await setup('prod-123');

    expect(sampleProduct.price).toBe(199.5);
    expect(element.textContent).toContain('199.50');
  });

  it('handles missing or non-numeric backend price safely without crashing', async () => {
    const invalidPriceProduct = makeProduct({
      id: 'prod-invalid',
      price: 'invalid-price',
    });
    await setup(
      'prod-invalid',
      of({
        status: true,
        code: 200,
        payload: { product: invalidPriceProduct },
      }),
    );

    expect(sampleProduct.price).toBe(0);
    expect(element.textContent).toContain('0.00');
  });

  it('handles zero stock and disables the Add to Cart button', async () => {
    const outOfStockProduct = makeProduct({
      id: 'prod-out',
      stock: 0,
    });
    await setup(
      'prod-out',
      of({ status: true, code: 200, payload: { product: outOfStockProduct } }),
    );

    const stockPill = element.querySelector('.stock-pill');
    expect(stockPill?.textContent).toContain('Out of stock');

    const addToCartBtn = element.querySelector(
      '.btn-add-to-cart',
    ) as HTMLButtonElement;
    expect(addToCartBtn?.disabled).toBe(true);
  });

  it('handles zero ratings truthfully', async () => {
    const zeroRatingProduct = makeProduct({
      id: 'prod-zero',
      rating: 0,
      ratings: 0,
    });
    await setup(
      'prod-zero',
      of({ status: true, code: 200, payload: { product: zeroRatingProduct } }),
    );

    expect(element.textContent).toContain('Rating: 0.0/5');
    expect(element.textContent).toContain('(No ratings yet)');
  });

  it('parses JSON gallery string, supports arrays, and deduplicates images', async () => {
    const complexProduct = makeProduct({
      id: 'prod-gallery',
      cover: 'https://example.com/cover.jpg',
      gallery: JSON.stringify([
        'https://example.com/img1.jpg',
        'https://example.com/img2.jpg',
      ]),
    });
    await setup(
      'prod-gallery',
      of({ status: true, code: 200, payload: { product: complexProduct } }),
    );

    expect(component.images()).toEqual([
      'https://example.com/cover.jpg',
      'https://example.com/img1.jpg',
      'https://example.com/img2.jpg',
    ]);
  });

  it('handles malformed gallery JSON safely and falls back to cover image', async () => {
    const malformedProduct = makeProduct({
      id: 'prod-malformed',
      cover: 'https://example.com/cover.jpg',
      gallery: '[bad json',
    });
    await setup(
      'prod-malformed',
      of({ status: true, code: 200, payload: { product: malformedProduct } }),
    );

    expect(component.images()).toEqual(['https://example.com/cover.jpg']);
  });

  it('supports normal string array gallery if returned by API', async () => {
    const arrayProduct = makeProduct({
      id: 'prod-array',
      cover: 'https://example.com/cover.jpg',
      gallery: [
        'https://example.com/extra1.jpg',
        'https://example.com/extra2.jpg',
      ] as unknown as string,
    });
    await setup(
      'prod-array',
      of({ status: true, code: 200, payload: { product: arrayProduct } }),
    );

    expect(component.images()).toEqual([
      'https://example.com/cover.jpg',
      'https://example.com/extra1.jpg',
      'https://example.com/extra2.jpg',
    ]);
  });

  it('handles single image product without fake or duplicated thumbnails', async () => {
    const singleImgProduct = makeProduct({
      id: 'prod-single',
      cover: 'https://example.com/single.jpg',
    });
    await setup(
      'prod-single',
      of({ status: true, code: 200, payload: { product: singleImgProduct } }),
    );

    expect(component.images()).toEqual(['https://example.com/single.jpg']);
  });

  it('synchronizes main image and thumbnails when thumbnail is clicked', async () => {
    await setup('prod-123');

    expect(component.images().length).toBe(3);
    expect(component.activePage()).toBe(0);

    const thumbnails = element.querySelectorAll('.gallery-thumb');
    expect(thumbnails.length).toBe(3);
    expect(thumbnails[0].classList.contains('gallery-thumb--active')).toBe(
      true,
    );

    (thumbnails[1] as HTMLElement).click();
    await settle();

    expect(component.activePage()).toBe(1);
  });

  it('shows error state with retry option when request fails', async () => {
    await setup(
      'prod-fail',
      throwError(() => new Error('Network error')),
    );

    expect(element.textContent).toContain('Failed to load product details.');
    const retryBtn = element.querySelector('button');
    expect(retryBtn?.textContent).toContain('Retry');

    getProductMock.mockReturnValue(
      of({
        status: true,
        code: 200,
        payload: { product: sampleProduct },
      } as ProductResponse),
    );
    retryBtn?.click();
    await settle();

    expect(getProductMock).toHaveBeenCalledTimes(2);
    expect(component.status()).toBe('success');
  });

  it('shows not-found state when API returns 404', async () => {
    await setup(
      'prod-404',
      throwError(() => ({ status: 404, message: 'Not found' })),
    );

    expect(element.textContent).toContain('Product not found.');
  });
});
