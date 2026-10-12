import {ChangeDetectionStrategy,Component,computed,input,output} from '@angular/core';
import { LucideAngularModule, ChevronRight } from 'lucide-angular';
import { BreadcrumbItem, Crumb } from './breadcrumb.types';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Breadcrumb {
  readonly ChevronRight = ChevronRight;

  items = input<BreadcrumbItem[]>([]);
  maxItems = input<number>(4);

  itemClick = output<BreadcrumbItem>();

  crumbs = computed<Crumb[]>(() => {
    const list = this.items();
    const max = this.maxItems();
    const result: Crumb[] = [];

    const toCrumb = (item: BreadcrumbItem, index: number): Crumb => ({
      kind: 'item',
      item,
      last: index === list.length - 1,
    });

    if (list.length > max) {
      result.push({ kind: 'ellipsis' });
      const start = list.length - (max - 1);
      list
        .slice(start)
        .forEach((item, i) => result.push(toCrumb(item, start + i)));
    } else {
      list.forEach((item, i) => result.push(toCrumb(item, i)));
    }
    return result;
  });

  onClick(item: BreadcrumbItem, last: boolean): void {
    if (!last) this.itemClick.emit(item);
  }
}
