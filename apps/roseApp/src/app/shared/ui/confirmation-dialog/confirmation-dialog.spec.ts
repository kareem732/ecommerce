import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Trash2 } from 'lucide-angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideTranslateTesting,useEnglish} from '../../utils/testing/translate.testing';
import { ConfirmationDialog } from './confirmation-dialog';
import { ConfirmationDialogData } from './confirmation-dialog.model';

describe('ConfirmationDialog', () => {
  let fixture: ComponentFixture<ConfirmationDialog>;
  let element: HTMLElement;
  let close: ReturnType<typeof vi.fn>;

  const render = (data: Partial<ConfirmationDialogData> = {}) => {
    TestBed.overrideProvider(DIALOG_DATA, {
      useValue: {
        message: 'Are you sure?',
        confirmText: 'Yes',
        cancelText: 'No',
        variant: 'danger',
        ...data,
      },
    });
    fixture = TestBed.createComponent(ConfirmationDialog);
    element = fixture.nativeElement;
    fixture.detectChanges();
  };

  const click = (selector: string) =>
    (element.querySelector(selector) as HTMLButtonElement).click();

  beforeEach(async () => {
    close = vi.fn();
    await TestBed.configureTestingModule({
      imports: [ConfirmationDialog],
      providers: [
        provideTranslateTesting(),
        { provide: DIALOG_DATA, useValue: {} },
        { provide: DialogRef, useValue: { close } },
      ],
    }).compileComponents();
    useEnglish();
  });

  it('renders the message and button labels', () => {
    render();

    expect(element.querySelector('.dialog__message')?.textContent?.trim()).toBe(
      'Are you sure?',
    );
    const buttons = element.querySelectorAll('.dialog__actions .btn');
    expect(buttons[0].textContent?.trim()).toBe('No');
    expect(buttons[1].textContent?.trim()).toBe('Yes');
  });

  it('renders the icon only when provided', () => {
    render();
    expect(element.querySelector('.dialog__icon')).toBeNull();

    TestBed.resetTestingModule();
  });

  it('renders the icon when provided', () => {
    render({ icon: Trash2 });

    expect(element.querySelector('.dialog__icon')).not.toBeNull();
  });

  it('closes with true on confirm', () => {
    render();

    click('.dialog__actions .btn:last-child');

    expect(close).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('closes with false on cancel', () => {
    render();

    click('.dialog__actions .btn--secondary');

    expect(close).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('closes with false from the close button', () => {
    render();

    click('.dialog__close');

    expect(close).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('applies the variant class to the confirm button', () => {
    render({ variant: 'primary' });

    const confirm = element.querySelector('.dialog__actions .btn:last-child')!;
    expect(confirm.classList).toContain('btn--primary');
    expect(confirm.classList).not.toContain('btn--danger');
  });

  it('is exposed as an alert dialog', () => {
    render();

    const dialog = element.querySelector('.dialog')!;
    expect(dialog.getAttribute('role')).toBe('alertdialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('labels the close button for screen readers', () => {
    render();

    expect(
      element.querySelector('.dialog__close')!.getAttribute('aria-label'),
    ).toBeTruthy();
  });
});
