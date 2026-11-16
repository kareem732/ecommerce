import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Button, Input } from '@org/ui';
import { ArrowRight, TicketPercent } from 'lucide-angular';
import { filter, map, startWith } from 'rxjs';
import { SectionTitle } from '../../../../shared/ui/section-title/section-title';
import { Carousel } from '../../components/carousel/carousel';
import { ProductCard } from '../../components/product-card/product-card';
import { Product } from '../../interfaces/home.model/home-model-response';
import { CartStore } from '../../stores/cart/cart.store';
import { HomeStore } from '../../stores/home/home.store';
import { WishlistStore } from '../../stores/wishlist/wishlist.store';

@Component({
  selector: 'app-checkout-flow',
  imports: [
    Button,
    Input,
    SectionTitle,
    ProductCard,
    Carousel,
    TranslatePipe,
    DecimalPipe,
    RouterOutlet,
    RouterLink,
  ],
  templateUrl: './checkout-flow.html',
  styleUrl: './checkout-flow.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutFlow implements OnInit {
  protected readonly ticketPercent = TicketPercent;
  protected readonly arrowRight = ArrowRight;

  protected readonly cart = inject(CartStore);
  protected readonly wishlist = inject(WishlistStore);
  protected readonly products = inject(HomeStore).bestSelling;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly total = computed(() => this.cart.subtotal());

  protected readonly showCheckout = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.readShowCheckout()),
      startWith(this.readShowCheckout()),
    ),
    { requireSync: true },
  );

  ngOnInit(): void {
    this.cart.load();
  }

  protected onAddToCart(product: Product): void {
    this.cart.add(product.id);
  }

  protected onAddToWishlist(product: Product): void {
    this.wishlist.toggle(product.id);
  }

  private readShowCheckout(): boolean {
    return this.route.snapshot.firstChild?.data?.['showCheckout'] === true;
  }
}