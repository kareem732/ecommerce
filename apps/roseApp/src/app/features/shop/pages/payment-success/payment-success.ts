import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CircleCheck, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-payment-success',
  imports: [LucideAngularModule, TranslatePipe, RouterLink],
  templateUrl: './payment-success.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentSuccess {
  protected readonly circleCheck = CircleCheck;
}
