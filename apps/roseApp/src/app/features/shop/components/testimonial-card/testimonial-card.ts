import { Component, Input } from '@angular/core';
import { TestimonialRes } from '../../interfaces/home.Testimonial/Testimonial';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-testimonial-card',
  imports: [DatePipe],
  templateUrl: './testimonial-card.html',
  styleUrl: './testimonial-card.scss',
})
export class TestimonialCard {
  @Input() testimonial !:TestimonialRes
  get stars() : boolean[]{
    return Array.from({ length: 5 },(_,i)=>i<this.testimonial.rating);
  }
}
