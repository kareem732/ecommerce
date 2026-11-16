import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { nextRovingIndex } from '../../../../../shared/utils/keyboard-navigation';
import {
  ADDRESS_TITLE_OPTIONS,
  DEFAULT_ADDRESS_TITLE,
} from '../../../constants/address.constants';

@Component({
  selector: 'app-address-title-picker',
  imports: [TranslatePipe],
  templateUrl: './address-title-picker.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressTitlePicker {
  readonly value = model<string>(DEFAULT_ADDRESS_TITLE);

  protected readonly options = ADDRESS_TITLE_OPTIONS;

  protected tabIndex(optionValue: string, index: number): number {
    const current = this.value();
    const hasSelection = this.options.some((option) => option.value === current);
    return optionValue === current || (!hasSelection && index === 0) ? 0 : -1;
  }

  protected onKeydown(event: KeyboardEvent): void {
    const current = this.options.findIndex((option) => option.value === this.value());
    const next = nextRovingIndex(event.key, current, this.options.length);
    if (next === null) return;

    event.preventDefault();
    this.value.set(this.options[next].value);
    (event.currentTarget as HTMLElement)
      .querySelectorAll<HTMLElement>('[role="radio"]')
      [next]?.focus();
  }
}
