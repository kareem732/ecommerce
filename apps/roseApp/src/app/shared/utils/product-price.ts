import { Product } from "../../features/shop/interfaces/home.model/home-model-response";
import { MS_PER_DAY, NEW_PRODUCT_DAYS } from "./product.constants";

export function hasDiscount(product: Product): boolean {
  return Number(product.discountValue ?? 0) > 0;
}

export function finalPrice(product: Product): number {
  const price = Number(product.price);
  if (!hasDiscount(product)) return price;
  return price - (price * Number(product.discountValue)) / 100;
}

export function isNew(product: Product): boolean {
  const ageInDays = (Date.now() - new Date(product.createdAt).getTime()) / MS_PER_DAY;
  return ageInDays <= NEW_PRODUCT_DAYS;
}

export function isOutOfStock(product: Product): boolean {
  return product.stock === 0;
}
