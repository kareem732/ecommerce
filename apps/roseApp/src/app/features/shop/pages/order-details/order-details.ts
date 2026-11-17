import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, MapPin, Phone, Truck } from 'lucide-angular';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { scrollToFragmentWhenReady } from '../../../../shared/utils/scroll-to-fragment';
import { BackButton } from '../../../auth/components/back-button/back-button';
import { OrderCard } from '../../components/order-card/order-card';
import { OrderTimeline } from '../../components/order-timeline/order-timeline';
import { TestimonialForm } from '../../components/testimonial-form/testimonial-form';
import { ORDERS_PATH } from '../../constants/shop-routes.constants';
import { OrderSummary } from '../../interfaces/order.model/order-history.model';
import { ShopService } from '../../services/shop.service';

/** `undefined` while loading, `null` when the order can't be loaded. */
type OrderState = OrderSummary | null | undefined;

@Component({
  selector: 'app-order-details',
  imports: [
    DecimalPipe,
    TranslatePipe,
    LucideAngularModule,
    BackButton,
    OrderCard,
    OrderTimeline,
    TestimonialForm,
  ],
  templateUrl: './order-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetails {
  private readonly shop = inject(ShopService);

  protected readonly ordersPath = ORDERS_PATH;
  protected readonly MapPin = MapPin;
  protected readonly Phone = Phone;
  protected readonly Truck = Truck;

  protected readonly order = toSignal(
    inject(ActivatedRoute).paramMap.pipe(
      map((params) => params.get('id') ?? ''),
      switchMap((id) =>
        this.shop.getOrder(id).pipe(
          map(({ payload }): OrderState => payload.order ?? null),
          catchError(() => of(null)),
          startWith(undefined),
        ),
      ),
    ),
    { initialValue: undefined as OrderState },
  );

  protected readonly isDelivered = computed(() => this.order()?.status === 'DELIVERED');
  protected readonly hasDiscount = computed(() => Number(this.order()?.discount) > 0);

  constructor() {
    scrollToFragmentWhenReady(() => !!this.order());
  }
}
