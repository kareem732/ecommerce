import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Headset, LucideAngularModule, RefreshCw, ShieldCheck, Truck } from 'lucide-angular';
import { Feature } from './feature-section.types';

@Component({
  selector: 'app-feature-section',
  imports: [TranslatePipe, LucideAngularModule],
  templateUrl: './feature-section.html',
  styleUrl: './feature-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureSection {
  protected readonly features: Feature[] = [
    { icon: Truck, key: 'SHOP.FEATURES.DELIVERY' },
    { icon: RefreshCw, key: 'SHOP.FEATURES.REFUND' },
    { icon: ShieldCheck, key: 'SHOP.FEATURES.PAYMENT' },
    { icon: Headset, key: 'SHOP.FEATURES.SUPPORT' },
  ];
}
