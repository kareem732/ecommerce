import { Routes } from '@angular/router';
import { ProductDetails } from '../components/product-details/product-details';

export const productsRoutes: Routes = [
  {
    path: ':id',
    component: ProductDetails,
  },
];
