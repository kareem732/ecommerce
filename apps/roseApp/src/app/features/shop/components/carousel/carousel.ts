import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy,Component,TemplateRef,contentChild,input} from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { CarouselBreakpoint } from './carousel.types';
import { DEFAULT_BREAKPOINTS } from './carousel.constants';

@Component({
  selector: 'app-carousel',
  imports: [CarouselModule, NgTemplateOutlet],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Carousel<T> {
  readonly showIndicators = input<boolean>(false);
  readonly items = input.required<T[]>();
  readonly numVisible = input<number>(3);
  readonly numScroll = input<number>(1);
  readonly circular = input<boolean>(false);
  readonly autoplayInterval = input<number>(0);
  readonly breakpoints = input<CarouselBreakpoint[]>(DEFAULT_BREAKPOINTS);

  protected readonly itemTemplate =
  contentChild.required<TemplateRef<{ $implicit: T }>>('itemTemplate');
}
