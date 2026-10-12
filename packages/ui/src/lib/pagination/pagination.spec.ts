import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pagination } from './pagination';

describe('Pagination', () => {
  let fixture: ComponentFixture<Pagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pagination],
    }).compileComponents();
    fixture = TestBed.createComponent(Pagination);
    fixture.detectChanges();
  });

  it('starts at the first page', () => {
    expect(fixture.componentInstance.first()).toBe(0);
    expect(fixture.componentInstance.currentPage()).toBe(1);
  });

  it('computes the current page from first and rows', () => {
    fixture.componentRef.setInput('rows', 10);
    fixture.componentRef.setInput('first', 20);
    expect(fixture.componentInstance.currentPage()).toBe(3);
  });

  it('updates first and emits a 1-based page on change', () => {
    const spy = jest.fn();
    fixture.componentInstance.pageChange.subscribe(spy);
    fixture.componentInstance.onPageChange({ first: 30, page: 3, rows: 10 });
    expect(fixture.componentInstance.first()).toBe(30);
    expect(spy).toHaveBeenCalledWith(4);
  });

  it('falls back to page 1 when the event is empty', () => {
    const spy = jest.fn();
    fixture.componentInstance.pageChange.subscribe(spy);
    fixture.componentInstance.onPageChange({});
    expect(fixture.componentInstance.first()).toBe(0);
    expect(spy).toHaveBeenCalledWith(1);
  });
});
