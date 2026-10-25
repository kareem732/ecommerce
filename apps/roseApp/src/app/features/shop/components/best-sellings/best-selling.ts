import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { Product } from '../../interfaces/home.model/home-model-response';
import { HomeStore } from '../../stores/home/home.store';
import { ProductCard } from '../product-card/product-card';
import { Carousel } from '../carousel/carousel';

@Component({
  selector: 'app-best-selling',
  imports: [Carousel, ProductCard, RouterLink, TranslatePipe, LucideAngularModule],
  templateUrl: './best-selling.html',
  styleUrl: './best-selling.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BestSelling {
  protected readonly ArrowRight = ArrowRight;
  protected readonly products = inject(HomeStore).bestSelling;
  protected onAddToCart(product: Product): void {
    console.log('add to cart', product.id);
  }
}

