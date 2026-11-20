import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, TriangleAlert } from 'lucide-angular';
import { ORDER_PROGRESS, ORDER_TIMELINE } from '../../constants/order.constants';
import { OrderStatus } from '../../interfaces/order.model/order-history.model';

type StepState = 'done' | 'current' | 'upcoming';

@Component({
  selector: 'app-order-timeline',
  imports: [TranslatePipe, LucideAngularModule],
  templateUrl: './order-timeline.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderTimeline {
  readonly status = input.required<OrderStatus>();

  protected readonly CanceledIcon = TriangleAlert;

  protected readonly isCanceled = computed(() => ORDER_PROGRESS[this.status()] === 'CANCELED');

  protected readonly steps = computed(() => {
    const current = ORDER_TIMELINE.findIndex((step) => step.status === this.status());
    return ORDER_TIMELINE.map((step, index) => ({
      ...step,
      state: (index < current ? 'done' : index === current ? 'current' : 'upcoming') as StepState,
      last: index === ORDER_TIMELINE.length - 1,
    }));
  });
}
