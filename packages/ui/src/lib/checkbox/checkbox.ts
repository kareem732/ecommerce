import {ChangeDetectionStrategy,Component,input,model} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';

let nextId = 0;

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CheckboxModule, FormsModule],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Checkbox {
  readonly id = `app-checkbox-${nextId++}`;

  label = input<string>('');
  error = input<string>('');
  disabled = input<boolean>(false);

  checked = model<boolean>(false);
}
