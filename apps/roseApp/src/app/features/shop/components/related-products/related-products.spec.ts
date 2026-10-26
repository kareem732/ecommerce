import { NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, contentChild, input, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Product } from '../../interfaces/home.model/home-model-response';
import { HomeStore } from '../../stores/home/home.store';
import { Carousel } from '../carousel/carousel';
import { makeProduct } from '../../../../shared/utils/testing/product.fixtures';
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
  let bestSelling: ReturnType<typeof signal<Product[]>>;

  const setup = async (initial: Product[] = products) => {
    bestSelling = signal<Product[]>(initial);

    await TestBed.configureTestingModule({
      imports: [RelatedProducts],
      providers: [{ provide: HomeStore, useValue: { bestSelling } }, provideTranslateTesting()],
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
  };

  it('renders a product card for every product', async () => {
    await setup();

    const cards = element.querySelectorAll('app-product-card');
    const titles = Array.from(element.querySelectorAll('.product__title')).map((el) =>
      el.textContent?.trim(),
    );

    expect(cards).toHaveLength(2);
    expect(titles).toEqual(['First Bouquet', 'Second Bouquet']);
  });

  it('renders the section title', async () => {
    await setup();

    expect(
      element.querySelector('app-section-title')?.textContent?.replace(/\s+/g, ' ').trim(),
    ).toBe('Related Products');
  });

  it('renders no cards, without breaking, when there are no products', async () => {
    await setup([]);

    expect(element.querySelectorAll('app-product-card')).toHaveLength(0);
    expect(element.querySelector('app-section-title')).toBeTruthy();
  });

  it('updates the cards when the store products change', async () => {
    await setup([]);

    bestSelling.set(products);
    fixture.detectChanges();

    expect(element.querySelectorAll('app-product-card')).toHaveLength(2);
  });
});
