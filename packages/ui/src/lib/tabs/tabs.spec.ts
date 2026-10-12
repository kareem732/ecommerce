import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tabs } from './tabs';
import { TabItem } from './tabs.types';

const ITEMS: TabItem[] = [
  { value: 'one', label: 'One', content: 'First panel' },
  { value: 'two', label: 'Two', content: 'Second panel' },
  { value: 'three', label: 'Three', content: 'Third panel', disabled: true },
];

describe('Tabs', () => {
  let fixture: ComponentFixture<Tabs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tabs],
    }).compileComponents();

    fixture = TestBed.createComponent(Tabs);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.componentRef.setInput('active', 'one');
    fixture.detectChanges();
  });

  it('renders a tab for every item', () => {
    const tabs = (fixture.nativeElement as HTMLElement).querySelectorAll(
      'p-tab',
    );
    expect(tabs).toHaveLength(3);
    expect(tabs[0].textContent).toContain('One');
  });

  it('keeps the active value from the model', () => {
    expect(fixture.componentInstance.active()).toBe('one');
  });

  it('updates the active model', () => {
    fixture.componentInstance.active.set('two');
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('two');
  });

  it('renders nothing when items is empty', () => {
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll('p-tab'),
    ).toHaveLength(0);
  });
});
