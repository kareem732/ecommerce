import {ChangeDetectionStrategy,Component,computed,input,output,signal} from '@angular/core';
import { LucideAngularModule, Info, Check, X } from 'lucide-angular';
import { AlertSeverity } from './alert.types';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './alert.html',
  styleUrl: './alert.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Alert {
  readonly CloseIcon = X;

  message = input.required<string>();
  severity = input<AlertSeverity>('info');
  closable = input<boolean>(true);

  dismissed = output<void>();

  visible = signal(true);

  icon = computed(() => {
    switch (this.severity()) {
      case 'success':
        return Check;
      case 'error':
        return X;
      default:
        return Info;
    }
  });

  close(): void {
    this.visible.set(false);
    this.dismissed.emit();
  }
}
