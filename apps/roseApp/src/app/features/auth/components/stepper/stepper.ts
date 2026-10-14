import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-stepper',
  imports: [TranslatePipe],
  templateUrl: './stepper.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Stepper {
  readonly current = input.required<number>();
  readonly total = input(4);

  readonly steps = computed(() =>
    Array.from({ length: this.total() }, (_, i) => {
      const n = i + 1;
      return {
        n,
        done: n < this.current(),
        active: n === this.current(),
        last: n === this.total(),
      };
    }),
  );
}
