import { Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BtnConfig } from './site-btn.model';

@Component({
  selector: 'app-btn',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './site-btn.html',
})
export class SiteBtn {
  config = input<BtnConfig>({});
  fireBtn = output<MouseEvent>();

  iconPos = computed(() => this.config().iconPos ?? 'left');
  disabled = computed(() => this.config().disabled ?? false);
  loading = computed(() => this.config().loading ?? false);
  btnType = computed(() => this.config().type ?? 'button');
  buttonClass = computed(() => {
    const base = this.config().fullWidth ? 'w-full' : '';
    const configClass = this.config().styleClass ?? '';
    return `${base} ${configClass} `.trim();
  });

  onClicked(event: MouseEvent) {
    if (!this.disabled()) {
      this.fireBtn.emit(event);
    }
  }
}