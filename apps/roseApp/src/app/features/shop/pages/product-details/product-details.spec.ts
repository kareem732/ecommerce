import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { makeProduct } from '../../../../shared/utils/testing/product.fixtures';
import { provideTranslateTesting,useEnglish} from '../../../../shared/utils/testing/translate.testing';
import { ProductReviews } from '../../components/product-reviews/product-reviews';
import { ProductResponse } from '../../interfaces/home.model/home-model-response';
import { ShopService } from '../../services/shop.service';
import { ProductDetails } from './product-details';

@Component({ selector: 'app-product-reviews', template: '' })
class ProductReviewsStub {
  readonly productId = input<string>();
}

describe('ProductDetails', () => {
  let fixture: ComponentFixture<ProductDetails>;
  let element: HTMLElement;
  let getProduct: ReturnType<typeof vi.fn>;
  let params: BehaviorSubject<ParamMap>;

  const sampleProduct = makeProduct({
    id: 'prod-123',
    title: 'Dreamy White Roses Bouquet',
    description: 'Elevate any celebration with our luxury rose bouquet.',
    price: '199.50',
    stock: 265,
    rating: 4.5,
    ratings: 8,
    cover: 'https://example.com/cover.jpg',
    gallery: JSON.stringify(['https://example.com/img1.jpg', 'https://example.com/img2.jpg']),
  });

  const respond = (product: ReturnType<typeof makeProduct>) =>
    of({ status: true, code: 200, payload: { product } } as ProductResponse);

  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const setup = async (
    routeId: string | null = 'prod-123',
    result: Observable<ProductResponse> = respond(sampleProduct),
  ) => {
    getProduct = vi.fn().mockReturnValue(result);
    params = new BehaviorSubject(convertToParamMap(routeId ? { id: routeId } : {}));

    await TestBed.configureTestingModule({
      imports: [ProductDetails],
      providers: [
        provideTranslateTesting(),
        { provide: ActivatedRoute, useValue: { paramMap: params } },
        { provide: ShopService, useValue: { getProduct } },
      ],
    })
      .overrideComponent(ProductDetails, {
        remove: { imports: [ProductReviews] },
        add: { imports: [ProductReviewsStub] },
      })
      .compileComponents();
    useEnglish();

    fixture = TestBed.createComponent(ProductDetails);
    element = fixture.nativeElement;
    await settle();
  };

  it('requests the product of the route id', async () => {
    await setup('prod-123');

    expect(getProduct).toHaveBeenCalledWith('prod-123');
  });

  it('shows the not-found message when the route has no id', async () => {
    await setup(null);

    expect(getProduct).not.toHaveBeenCalled();
    expect(element.textContent).toContain('Product not found');
  });

  it('renders title, stock, rating and description', async () => {
    await setup();

    expect(element.querySelector('#product-title')?.textContent?.trim()).toBe(
      'Dreamy White Roses Bouquet',
    );
    expect(element.querySelector('.stock-pill')?.textContent).toContain('265 left in stock');
    expect(element.textContent).toContain('Rating: 4.5/5');
    expect(element.textContent).toContain('(8 ratings)');
    expect(element.textContent).toContain('Elevate any celebration');
  });

  it('renders the price with two decimals', async () => {
    await setup();

    expect(element.textContent).toContain('199.50');
  });

  it('shows out of stock and disables add to cart when stock is 0', async () => {
    await setup('p', respond(makeProduct({ id: 'p', stock: 0 })));

    expect(element.querySelector('.stock-pill')?.textContent).toContain('Out of stock');
    expect((element.querySelector('.btn-add-to-cart') as HTMLButtonElement).disabled).toBe(true);
  });

  it('enables add to cart when the product is in stock', async () => {
    await setup();

    expect((element.querySelector('.btn-add-to-cart') as HTMLButtonElement).disabled).toBe(false);
  });

  it('shows "No ratings yet" for an unrated product', async () => {
    await setup('p', respond(makeProduct({ id: 'p', rating: 0, ratings: 0 })));

    expect(element.textContent).toContain('Rating: 0.0/5');
    expect(element.textContent).toContain('(No ratings yet)');
  });

  it('renders one thumbnail per image and marks the first as active', async () => {
    await setup();

    const thumbs = element.querySelectorAll('.gallery-thumb');
    expect(thumbs).toHaveLength(3);
    expect(thumbs[0].classList.contains('gallery-thumb--active')).toBe(true);
  });

  it('activates a thumbnail when it is clicked', async () => {
    await setup();

    (element.querySelectorAll('.gallery-thumb')[1] as HTMLElement).click();
    await settle();

    const thumbs = element.querySelectorAll('.gallery-thumb');
    expect(thumbs[1].classList.contains('gallery-thumb--active')).toBe(true);
    expect(thumbs[0].classList.contains('gallery-thumb--active')).toBe(false);
  });

  it('falls back to the cover when the gallery json is malformed', async () => {
    await setup(
      'p',
      respond(makeProduct({ id: 'p', cover: 'https://example.com/c.jpg', gallery: '[bad json' })),
    );

    expect(element.querySelectorAll('.gallery-thumb')).toHaveLength(1);
  });

  it('shows the error state and retries on click', async () => {
    await setup('prod-fail', throwError(() => ({ status: 500 })));

    expect(element.textContent).toContain('Failed to load product details.');
    const retryBtn = element.querySelector('button') as HTMLButtonElement;
    expect(retryBtn.textContent).toContain('Retry');

    getProduct.mockReturnValue(respond(sampleProduct));
    retryBtn.click();
    await settle();

    expect(getProduct).toHaveBeenCalledTimes(2);
    expect(element.querySelector('#product-title')).toBeTruthy();
  });

  it('shows the not-found state on a 404', async () => {
    await setup('prod-404', throwError(() => ({ status: 404 })));

    expect(element.textContent).toContain('Product not found');
  });

  it('loads the new product when the route id changes', async () => {
    await setup('prod-123');

    getProduct.mockReturnValue(respond(makeProduct({ id: 'prod-456', title: 'Tulips' })));
    params.next(convertToParamMap({ id: 'prod-456' }));
    await settle();

    expect(getProduct).toHaveBeenLastCalledWith('prod-456');
    expect(element.querySelector('#product-title')?.textContent?.trim()).toBe('Tulips');
  });
});