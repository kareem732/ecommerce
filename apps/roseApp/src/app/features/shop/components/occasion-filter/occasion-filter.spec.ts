import { ComponentFixture, TestBed } from '@angular/core/testing';
import { makeOccasion } from '../../../../shared/utils/testing/product.fixtures';
import { OccasionFilter } from './occasion-filter';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
describe('OccasionFilter', () => {
  const occasions = [
    makeOccasion({ id: 'w', title: 'Wedding' }),
    makeOccasion({ id: 'a', title: 'Anniversary' }),
  ];

  let fixture: ComponentFixture<OccasionFilter>;
  let element: HTMLElement;

  const buttons = () =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('.filter__item'));

  const labels = () => buttons().map((b) => b.textContent?.trim());

  const select = (id: string | null) => {
    fixture.componentRef.setInput('selectedId', id);
    fixture.detectChanges();
  };

  beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [OccasionFilter],
    providers: [provideTranslateService()],
  }).compileComponents();

  const translate = TestBed.inject(TranslateService);
  translate.setTranslation('en', {
    SHOP: {
      FILTER: { ALL: 'All', LABEL: 'Filter by occasion' },
      OCCASIONS: { Wedding: 'Wedding' },
    },
  });
  translate.use('en');

  fixture = TestBed.createComponent(OccasionFilter);
  element = fixture.nativeElement;
  fixture.componentRef.setInput('occasions', occasions);
  fixture.detectChanges();
});
  it('renders All first, then a button for every occasion', () => {
    expect(labels()).toEqual(['All', 'Wedding', 'Anniversary']);
  });

  it('falls back to the API title when there is no translation', () => {
    expect(labels()[2]).toBe('Anniversary');
  });

  it('translates the title when a translation exists', () => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('ar', {
      SHOP: {
        FILTER: { ALL: 'الكل' },
        OCCASIONS: { Wedding: 'زفاف' },
      },
    });
    translate.use('ar');
    fixture.detectChanges();

    expect(labels()).toEqual(['الكل', 'زفاف', 'Anniversary']);
  });

  it('marks All as active when nothing is selected', () => {
    const active = element.querySelectorAll('.filter__item--active');

    expect(active).toHaveLength(1);
    expect(active[0].textContent?.trim()).toBe('All');
  });

  it('marks only the selected occasion as active', () => {
    select('a');

    const active = element.querySelectorAll('.filter__item--active');
    expect(active).toHaveLength(1);
    expect(active[0].textContent?.trim()).toBe('Anniversary');
  });

  it('emits the id of the clicked occasion', () => {
    let emitted: string | null | undefined;
    fixture.componentInstance.selectedChange.subscribe((id) => (emitted = id));

    buttons()[1].click();

    expect(emitted).toBe('w');
  });

  it('emits null when All is clicked', () => {
    select('a');
    let emitted: string | null | undefined;
    fixture.componentInstance.selectedChange.subscribe((id) => (emitted = id));

    buttons()[0].click();

    expect(emitted).toBeNull();
  });

  it('does not emit when the active filter is clicked again', () => {
    select('a');
    let emitted: string | null | undefined;
    fixture.componentInstance.selectedChange.subscribe((id) => (emitted = id));

    buttons()[2].click();

    expect(emitted).toBeUndefined();
  });

  it('does not emit when All is clicked while it is already active', () => {
    let emitted: string | null | undefined;
    fixture.componentInstance.selectedChange.subscribe((id) => (emitted = id));

    buttons()[0].click();

    expect(emitted).toBeUndefined();
  });
});
