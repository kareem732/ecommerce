import { Component, inject } from '@angular/core';
import { SectionTitle } from '../../../../shared/ui/section-title/section-title';
import { TestimonialCard } from '../testimonial-card/testimonial-card';
import { TestimonialRes } from '../../interfaces/home.Testimonial/Testimonial';
import { ShopService } from '../../services/shop.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-testimonials',
  imports: [SectionTitle, TestimonialCard,TranslatePipe
  ],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss',
})
export class Testimonials {
  private readonly shopService = inject(ShopService);
  testimonials: TestimonialRes[] = [];
  ngOnInit(): void {
    this.shopService.getTestimonials().subscribe((res) => {
      this.testimonials = res.payload.data;
    });
  }
}
