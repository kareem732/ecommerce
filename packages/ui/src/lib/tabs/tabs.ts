import {ChangeDetectionStrategy,Component,input,model} from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { TabItem } from './tabs.types';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [TabsModule],
  templateUrl: './tabs.html',
  styleUrl: './tabs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tabs {
  items = input<TabItem[]>([]);
  active = model<string>('');
}
