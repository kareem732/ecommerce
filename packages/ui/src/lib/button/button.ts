import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { Spinner } from '../spinner/spinner';
import { ButtonVariant } from './button.types';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [LucideAngularModule, Spinner],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  label = input<string>('Button');
  variant = input<ButtonVariant>('primary');
  type = input<'button' | 'submit' | 'reset'>('button');
  icon = input<string>('');
  endIcon = input<LucideIconData | null>(null);
  ariaLabel = input<string>('');
  loading = input<boolean>(false);
  disabled = input<boolean>(false);
  fullWidth = input<boolean>(false);

  clicked = output<MouseEvent>();

  isDisabled = computed(() => this.disabled() || this.loading());

  onClick(event: MouseEvent): void {
    if (!this.isDisabled()) {
      this.clicked.emit(event);
    }
  }
}
