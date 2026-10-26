import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
  protected readonly testimonials = inject(HomeStore).testimonials;
}
