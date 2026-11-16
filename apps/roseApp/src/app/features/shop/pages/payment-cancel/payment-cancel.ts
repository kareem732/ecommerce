import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CircleX, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-payment-cancel',
  imports: [LucideAngularModule, TranslatePipe, RouterLink],
  templateUrl: './payment-cancel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentCancel {
  protected readonly circleX = CircleX;
}
