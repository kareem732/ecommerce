import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@org/ui';
import { Trash2 } from 'lucide-angular';
import { Dialog } from 'primeng/dialog';
import { ConfirmationDialogService } from '../../../../../shared/business/confirmation-dialog.service';
import { toAddressRequest, toUpdateRequest } from '../../../utils/address.mapper';
import { AddressDraft, AddressLike } from '../../../interfaces/address.model/address.types';
import { AddressStore } from '../../../stores/address/address.store';
import { AddressFormModal } from '../address-form-modal/address-form-modal';
import { AddressItem } from '../address-item/address-item';

const DELETE_CONFIRMATION = { message: 'ADDRESS.CONFIRM_DELETE', icon: Trash2 };
const CONFIRM_OPTIONS = { lockScroll: false };

@Component({
  selector: 'app-my-addresses-modal',
  imports: [Dialog, TranslatePipe, Button, AddressItem, AddressFormModal],
  templateUrl: './my-addresses-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyAddressesModal {
  readonly visible = model(false);
  readonly startWithForm = input(false);

  protected readonly store = inject(AddressStore);
  private readonly confirmation = inject(ConfirmationDialogService);

  protected readonly formOpen = signal(false);
  protected readonly editing = signal<AddressLike | null>(null);
  protected readonly deletingId = signal<string | null>(null);
  protected readonly confirming = signal(false);

  protected readonly showForm = computed(() => this.startWithForm() || this.formOpen());

  constructor() {
    effect(() => {
      if (!this.visible()) return;
      untracked(() => {
        void this.store.load();
        this.editing.set(null);
        this.formOpen.set(false);
      });
    });
  }

  protected onDialogVisibleChange(open: boolean): void {
    if (!open && (this.confirming() || this.store.saving())) return;
    this.visible.set(open);
  }

  protected openAdd(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(address: AddressLike): void {
    this.editing.set(address);
    this.formOpen.set(true);
  }

  protected async onSave(draft: AddressDraft): Promise<void> {
    const current = this.editing();

    const saved = current
      ? await this.store.update(current.id, toUpdateRequest(draft))
      : await this.store.add(toAddressRequest(draft, this.store.count() === 0));

    if (saved) this.closeAll();
  }

  protected async onRemove(id: string): Promise<void> {
    this.confirming.set(true);
    const confirmed = await this.confirmation
      .confirm(DELETE_CONFIRMATION, CONFIRM_OPTIONS)
      .finally(() => this.confirming.set(false));
    if (!confirmed) return;

    this.deletingId.set(id);
    await this.store.remove(id);
    this.deletingId.set(null);
  }

  private closeAll(): void {
    this.formOpen.set(false);
    this.editing.set(null);
    this.visible.set(false);
  }
}
