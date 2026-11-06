import { Component, computed, inject, input, OnInit, signal, WritableSignal } from '@angular/core';
import { Button, Input } from '@org/ui';
import { TicketPercent, LucideAngularModule, ArrowRight, ShoppingBasket, Star, Trash2, Minus, Plus, ArrowLeft } from 'lucide-angular';
import { CartService } from '../../services/cart.service';
import { CartResponse } from '../../interfaces/cart.model/cart.model';
import { SectionTitle } from '../../../../shared/ui/section-title/section-title';
import { WishlistStore } from '../../stores/wishlist/wishlist.store';
import { HomeStore } from '../../stores/home/home.store';
import { Product } from '../../interfaces/home.model/home-model-response';
import { ProductCard } from '../../components/product-card/product-card';
import { ToastrService } from 'ngx-toastr';
import { Carousel } from '../../components/carousel/carousel';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
  selector: 'app-cart',
  imports: [Button, LucideAngularModule, Input, SectionTitle, ProductCard, Carousel, TranslatePipe ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart implements OnInit {
protected readonly ticketPercent = TicketPercent
protected readonly arrowRight = ArrowRight
protected readonly shoppingBasket = ShoppingBasket
protected readonly star = Star
protected readonly trash2 = Trash2
protected readonly minus = Minus
protected readonly plus = Plus
protected readonly arrowLeft = ArrowLeft

protected readonly wishlist = inject(WishlistStore)
protected readonly products = inject(HomeStore).bestSelling;
protected readonly toastrService = inject(ToastrService)

ngOnInit(): void {
  this.getLoggedUserCart()
}

protected readonly cartService = inject(CartService)
cartDetails = signal<CartResponse | null>(null);
cartItems = computed(() => {
  const payload = this.cartDetails()?.payload;

  if (!payload) return [];

  return Array.isArray(payload)
    ? payload
    : payload.cartItems ?? [];
});

getLoggedUserCart(){
  this.cartService.getCart().subscribe({
    next: (res) => {
      console.log(res);
      this.cartDetails.set(res)
    },
    error: (err) => {
      console.log(err);
    }
  });

}

deleteItemFromCart(itemId:string){
  this.cartService.removeItemFromCart(itemId).subscribe({
    next: (res) => {
      console.log(res);
      this.getLoggedUserCart()
    },
    error: (err) => {
      console.log(err);
    }
  });
}

resetCartItems(){
  this.cartService.clearCart().subscribe({
    next: (res) => {
      console.log(res);
      this.getLoggedUserCart()
      
    },
    error: (err) => {
      console.log(err);
    }
  });
}

updateQuantity(itemId: string, itemQuantity: number) {
  if (itemQuantity < 1) return;

  this.cartService.UpdateItemQuantity(itemId, {
    quantity: itemQuantity
  }).subscribe({
    next: (res) => {
      console.log(res);
      this.getLoggedUserCart();
    },
    error: (err) => {
      console.log(err);
    }
  });
}

  protected onAddToCart(product: Product): void {
    const body = {
      productId: product.id,
      quantity: 1,
    };
    this.cartService.addToCart(body). subscribe({
      next: (res) => {
        console.log('Added to cart successfully', res);
        this.toastrService.success('Added to cart successfully','Rose App')
        
      },
      error: (err) => {
        console.error('Error adding product to cart', err);
      }
    });
  }
  protected onAddToWishlist(product: Product): void {
    this.wishlist.toggle(product.id);
  }
}
