import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateTesting, useEnglish} from '../../../../shared/utils/testing/translate.testing';
import { Carousel } from './carousel';

@Component({
  imports: [Carousel],
  template: `
    <app-carousel [items]="items" [numVisible]="3" [showIndicators]="showIndicators()">
      <ng-template #itemTemplate let-item>
        <span class="test-item">{{ item }}</span>
      </ng-template>
    </app-carousel>
  `,
})
class HostComponent {
  items = ['one', 'two', 'three', 'four'];
  showIndicators = signal(false);
}

describe('Carousel', () => {
  let fixture: ComponentFixture<HostComponent>;
  let element: HTMLElement;

  const indicators = () =>
    element.querySelector('.p-carousel-indicator-list, .p-carousel-indicators');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideTranslateTesting()],
    }).compileComponents();
    useEnglish();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('renders the PrimeNG carousel', () => {
    expect(element.querySelector('p-carousel')).toBeTruthy();
  });

  it('renders the item template with each item as context', () => {
    const text = element.textContent ?? '';

    expect(text).toContain('one');
    expect(text).toContain('two');
    expect(text).toContain('three');
  });

  it('hides the indicators by default', () => {
    expect(indicators()).toBeNull();
  });

  it('shows the indicators when enabled', () => {
    fixture.componentInstance.showIndicators.set(true);
    fixture.detectChanges();

    expect(indicators()).toBeTruthy();
  });
});
