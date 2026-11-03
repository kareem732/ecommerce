import { Dialog } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmationDialog } from '../ui/confirmation-dialog/confirmation-dialog';
import { ConfirmationDialogService } from './confirmation-dialog.service';

describe('ConfirmationDialogService', () => {
  let open: ReturnType<typeof vi.fn>;
  let service: ConfirmationDialogService;

  const setup = (closed: unknown) => {
    open = vi.fn(() => ({ closed: of(closed) }));
    TestBed.configureTestingModule({
      providers: [{ provide: Dialog, useValue: { open } }],
    });
    service = TestBed.inject(ConfirmationDialogService);
  };

  beforeEach(() => TestBed.resetTestingModule());

  it('opens the confirmation dialog component', async () => {
    setup(true);

    await service.confirm({ message: 'MSG' });

    expect(open).toHaveBeenCalledTimes(1);
    expect(open.mock.calls[0][0]).toBe(ConfirmationDialog);
  });

  it('applies the default texts and danger variant', async () => {
    setup(true);

    await service.confirm({ message: 'MSG' });

    expect(open.mock.calls[0][1].data).toEqual({
      message: 'MSG',
      confirmText: 'COMMON.CONFIRM',
      cancelText: 'COMMON.CANCEL',
      variant: 'danger',
    });
  });

  it('lets the caller override the defaults', async () => {
    setup(true);

    await service.confirm({
      message: 'MSG',
      confirmText: 'YES',
      cancelText: 'NO',
      variant: 'primary',
    });

    expect(open.mock.calls[0][1].data).toMatchObject({
      confirmText: 'YES',
      cancelText: 'NO',
      variant: 'primary',
    });
  });

  it('prevents closing by backdrop or escape', async () => {
    setup(true);

    await service.confirm({ message: 'MSG' });

    expect(open.mock.calls[0][1].disableClose).toBe(true);
  });

  it('resolves true when confirmed', async () => {
    setup(true);

    await expect(service.confirm({ message: 'MSG' })).resolves.toBe(true);
  });

  it('resolves false when cancelled', async () => {
    setup(false);

    await expect(service.confirm({ message: 'MSG' })).resolves.toBe(false);
  });

  it('resolves false when the dialog closes without a result', async () => {
    setup(undefined);

    await expect(service.confirm({ message: 'MSG' })).resolves.toBe(false);
  });
});
