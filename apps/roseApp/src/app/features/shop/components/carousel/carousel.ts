import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy,Component,TemplateRef,computed,contentChild,inject,input,} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
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
  private readonly translate = inject(TranslateService);

  readonly showIndicators = input<boolean>(false);
  readonly items = input.required<T[]>();
  readonly numVisible = input<number>(3);
  readonly numScroll = input<number>(1);
  readonly circular = input<boolean>(false);
  readonly autoplayInterval = input<number>(0);
  readonly breakpoints = input<CarouselBreakpoint[]>(DEFAULT_BREAKPOINTS);

  protected readonly itemDir = computed(() =>
    this.translate.currentLang() === 'ar' ? 'rtl' : 'ltr',
  );

  protected readonly itemTemplate =
    contentChild.required<TemplateRef<{ $implicit: T }>>('itemTemplate');
}
