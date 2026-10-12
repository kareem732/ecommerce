import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountMenu } from './account-menu';
import { AccountMenuItem } from './account-menu.types';
describe('AccountMenu', () => {
  let fixture: ComponentFixture<AccountMenu>;
  const root = () => fixture.nativeElement as HTMLElement;
  const trigger = () =>
    root().querySelector('.account-menu__trigger') as HTMLButtonElement;
  const items = () =>
    Array.from(
      root().querySelectorAll('.account-menu__item'),
    ) as HTMLButtonElement[];
  const itemByLabel = (label: string) =>
    items().find((b) => b.textContent?.includes(label)) as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountMenu],
    }).compileComponents();
    fixture = TestBed.createComponent(AccountMenu);
    fixture.detectChanges();
  });

  it('is closed by default and shows the trigger label', () => {
    expect(root().querySelector('.account-menu__panel')).toBeNull();
    expect(trigger().textContent).toContain('Account');
  });

  it('opens on trigger click and sets aria-expanded', () => {
    trigger().click();
    fixture.detectChanges();
    expect(root().querySelector('.account-menu__panel')).not.toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('renders the title and the default items', () => {
    trigger().click();
    fixture.detectChanges();
    expect(root().querySelector('.account-menu__title')?.textContent).toContain(
      'My Account',
    );
    expect(items()).toHaveLength(11);
  });

  it('emits itemSelected and closes for a normal item', () => {
    const spy = jest.fn();
    fixture.componentInstance.itemSelected.subscribe(spy);
    trigger().click();
    fixture.detectChanges();
    itemByLabel('Billing').click();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'billing' }),
    );
    expect(root().querySelector('.account-menu__panel')).toBeNull();
  });

  it('stays open for items with a submenu', () => {
    const spy = jest.fn();
    fixture.componentInstance.itemSelected.subscribe(spy);
    trigger().click();
    fixture.detectChanges();
    itemByLabel('Invite users').click();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
    expect(root().querySelector('.account-menu__panel')).not.toBeNull();
  });

  it('does not emit for a disabled item', () => {
    const spy = jest.fn();
    fixture.componentInstance.itemSelected.subscribe(spy);
    trigger().click();
    fixture.detectChanges();
    expect(itemByLabel('API').disabled).toBe(true);
    fixture.componentInstance.select({
      id: 'api',
      label: 'API',
      disabled: true,
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('closes on Escape and on outside click', () => {
    trigger().click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(fixture.componentInstance.open()).toBe(false);

    trigger().click();
    fixture.detectChanges();
    document.body.click();
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('renders custom groups', () => {
    const groups: AccountMenuItem[][] = [[{ id: 'x', label: 'Custom item' }]];
    fixture.componentRef.setInput('groups', groups);
    trigger().click();
    fixture.detectChanges();
    expect(items()).toHaveLength(1);
    expect(items()[0].textContent).toContain('Custom item');
  });
});
