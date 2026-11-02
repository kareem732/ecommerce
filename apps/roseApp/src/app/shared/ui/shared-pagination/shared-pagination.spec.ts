import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedPagination } from './shared-pagination';

describe('SharedPagination', () => {
  let fixture: ComponentFixture<SharedPagination>;
  let component: SharedPagination;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SharedPagination] }).compileComponents();
    fixture = TestBed.createComponent(SharedPagination);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('currentPage', 2);
    fixture.componentRef.setInput('pageSize', 12);
    fixture.componentRef.setInput('totalItems', 30);
    fixture.detectChanges();
  });

  it('renders the PrimeNG paginator with the one-based current page translated to offset', () => {
    const currentPage = fixture.nativeElement.querySelector('[aria-current="page"]');
    expect(currentPage).not.toBeNull();
    expect(currentPage.textContent.trim()).toBe('2');
  });

  it('emits page selection from the rendered paginator', () => {
    const change = vi.fn();
    component.pageChange.subscribe(change);

    fixture.nativeElement.querySelectorAll('.p-paginator-page').item(2).click();

    expect(change).toHaveBeenCalledWith({ page: 2, rows: 12 });
  });

  it('emits Previous and Next navigation from the rendered controls', () => {
    const change = vi.fn();
    component.pageChange.subscribe(change);

    const previous = fixture.nativeElement.querySelector('.p-paginator-prev');
    const next = fixture.nativeElement.querySelector('.p-paginator-next');
    previous.click();
    expect(change).toHaveBeenLastCalledWith({ page: 0, rows: 12 });
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();
    next.click();
    expect(change).toHaveBeenLastCalledWith({ page: 1, rows: 12 });
  });

  it('does not emit for previous navigation at the first-page boundary', () => {
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();
    const change = vi.fn();
    component.pageChange.subscribe(change);

    fixture.nativeElement.querySelector('.p-paginator-prev').click();

    expect(change).not.toHaveBeenCalled();
  });

  it('does not emit for next navigation at the last-page boundary', () => {
    fixture.componentRef.setInput('currentPage', 3);
    fixture.detectChanges();
    const change = vi.fn();
    component.pageChange.subscribe(change);

    fixture.nativeElement.querySelector('.p-paginator-next').click();

    expect(change).not.toHaveBeenCalled();
  });

  it('disables navigation and removes page links for zero results', () => {
    fixture.componentRef.setInput('totalItems', 0);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.p-paginator-page')).toHaveLength(0);
    expect((fixture.nativeElement.querySelector('.p-paginator-prev') as HTMLButtonElement).disabled)
      .toBe(true);
    expect((fixture.nativeElement.querySelector('.p-paginator-next') as HTMLButtonElement).disabled)
      .toBe(true);
  });
});
