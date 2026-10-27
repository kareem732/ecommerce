import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SectionTitle } from '../../../../shared/ui/section-title/section-title';
import { HomeStore } from '../../stores/home/home.store';
import { TestimonialCard } from '../testimonial-card/testimonial-card';

@Component({
  selector: 'app-testimonials',
  imports: [SectionTitle, TestimonialCard, TranslatePipe],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Testimonials {
  private readonly all = inject(HomeStore).testimonials;
  protected readonly testimonials = computed(() => this.all().slice(0, 3));
}
