import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { TabsModule } from 'primeng/tabs';

export interface TabItem {
  value: string;
  label: string;
  content?: string;
  disabled?: boolean;
}

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
