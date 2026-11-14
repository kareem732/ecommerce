import { Route } from '@angular/router';

export const CHECKOUT_FLOW_ROUTE: Route = {
  path: 'cart',
  loadComponent: () =>
    import('../layout/checkout-flow/checkout-flow').then((m) => m.CheckoutFlow),
  children: [
    {
      path: '',
      pathMatch: 'full',
      data: { showCheckout: true },
      loadComponent: () => import('../pages/cart/cart').then((m) => m.Cart),
    },
    {
      path: 'shipping-address',
      loadComponent: () =>
        import('../pages/shipping-address/shipping-address').then((m) => m.ShippingAddress),
    },
    {
      path: 'payment',
      loadComponent: () =>
        import('../pages/payment-method/payment-method').then((m) => m.PaymentMethod),
    },
  ],
};
