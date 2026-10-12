import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Breadcrumb } from './breadcrumb';
import { BreadcrumbItem } from './breadcrumb.types';

const item = (label: string) => ({ label }) as BreadcrumbItem;
const makeItems = (n: number) =>
  Array.from({ length: n }, (_, i) => item(`Item ${i + 1}`));

describe('Breadcrumb', () => {
  let fixture: ComponentFixture<Breadcrumb>;
  const root = () => fixture.nativeElement as HTMLElement;
  const links = () =>
    Array.from(
      root().querySelectorAll('.breadcrumb__link'),
    ) as HTMLButtonElement[];
  const ellipsis = () => root().querySelector('.breadcrumb__ellipsis');
  const separators = (scope: ParentNode = root()) =>
    scope.querySelectorAll('lucide-icon.breadcrumb__separator');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Breadcrumb],
    }).compileComponents();

    fixture = TestBed.createComponent(Breadcrumb);
    fixture.detectChanges();
  });

  function setItems(items: BreadcrumbItem[], maxItems?: number) {
    fixture.componentRef.setInput('items', items);
    if (maxItems !== undefined) {
      fixture.componentRef.setInput('maxItems', maxItems);
    }
    fixture.detectChanges();
  }

  it('renders nothing when there are no items', () => {
    expect(root().querySelectorAll('.breadcrumb__item')).toHaveLength(0);
  });

  it('renders every item when the count is within maxItems', () => {
    setItems(makeItems(3));
    expect(links()).toHaveLength(3);
    expect(links()[0].textContent).toContain('Item 1');
    expect(ellipsis()).toBeNull();
  });

  it('does not collapse when the count equals maxItems', () => {
    setItems(makeItems(4));
    expect(links()).toHaveLength(4);
    expect(ellipsis()).toBeNull();
  });

  it('marks only the last item as the current page', () => {
    setItems(makeItems(3));
    const last = links()[2];
    expect(last.disabled).toBe(true);
    expect(last.getAttribute('aria-current')).toBe('page');
    expect(last.classList).toContain('breadcrumb__link--current');

    expect(links()[0].disabled).toBe(false);
    expect(links()[0].getAttribute('aria-current')).toBeNull();
    expect(links()[0].classList).not.toContain('breadcrumb__link--current');
  });

  it('renders a separator between items but not after the last one', () => {
    setItems(makeItems(3));
    const lis = root().querySelectorAll('.breadcrumb__item');
    expect(separators()).toHaveLength(2);
    expect(separators(lis[2])).toHaveLength(0);
  });

  it('collapses the start into an ellipsis when over maxItems', () => {
    setItems(makeItems(6));
    expect(ellipsis()).not.toBeNull();
    expect(links().map((l) => l.textContent?.trim())).toEqual([
      'Item 4',
      'Item 5',
      'Item 6',
    ]);
  });

  it('puts a separator after the ellipsis', () => {
    setItems(makeItems(6));
    const first = root().querySelector('.breadcrumb__item') as HTMLElement;
    expect(first.querySelector('.breadcrumb__ellipsis')).not.toBeNull();
    expect(separators(first)).toHaveLength(1);
  });

  it('respects a custom maxItems', () => {
    setItems(makeItems(5), 3);
    expect(ellipsis()).not.toBeNull();
    expect(links().map((l) => l.textContent?.trim())).toEqual([
      'Item 4',
      'Item 5',
    ]);
  });

  it('emits itemClick for a non-last item', () => {
    const spy = jest.fn();
    fixture.componentInstance.itemClick.subscribe(spy);
    const items = makeItems(3);
    setItems(items);
    links()[1].click();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(items[1]);
  });

  it('does not emit itemClick for the last item', () => {
    const spy = jest.fn();
    fixture.componentInstance.itemClick.subscribe(spy);
    const items = makeItems(3);
    setItems(items);
    links()[2].click();
    fixture.componentInstance.onClick(items[2], true);
    expect(spy).not.toHaveBeenCalled();
  });

  it('exposes the navigation landmark label', () => {
    expect(root().querySelector('nav')?.getAttribute('aria-label')).toBe(
      'Breadcrumb',
    );
  });
});
