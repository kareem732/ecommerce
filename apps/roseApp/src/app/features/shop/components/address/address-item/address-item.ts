import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, MapPin, PenLine, Phone, Trash2 } from 'lucide-angular';
import { ADDRESS_TITLES } from '../../../constants/address.constants';
import { AddressLike } from '../../../interfaces/address.model/address.types';

const KNOWN_TITLES: readonly string[] = (ADDRESS_TITLES as readonly string[]).map((t) =>
  t.toLowerCase(),
);

@Component({
  selector: 'app-address-item',
  imports: [LucideAngularModule, TranslatePipe],
  templateUrl: './address-item.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressItem {
  readonly address = input.required<AddressLike>();
  readonly active = input(false);
  readonly busy = input(false);

  readonly picked = output<string>();
  readonly edit = output<AddressLike>();
  readonly remove = output<string>();

  protected readonly pinIcon = MapPin;
  protected readonly phoneIcon = Phone;
  protected readonly editIcon = PenLine;
  protected readonly deleteIcon = Trash2;

  protected readonly titleKey = computed(() => {
    const title = this.address().title?.trim().toLowerCase();
    return title && KNOWN_TITLES.includes(title) ? `ADDRESS.CATEGORIES.${title.toUpperCase()}` : null;
  });

  protected select(): void {
    if (this.busy() || this.active()) return;
    this.picked.emit(this.address().id);
  }

  protected onKey(event: Event): void {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    this.select();
  }

  protected onEdit(event: Event): void {
    event.stopPropagation();
    this.edit.emit(this.address());
  }

  protected onRemove(event: Event): void {
    event.stopPropagation();
    this.remove.emit(this.address().id);
  }
}
