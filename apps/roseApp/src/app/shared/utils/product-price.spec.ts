import { daysAgo, makeProduct } from './testing/product.fixtures';
import { finalPrice, hasDiscount, isNew, isOutOfStock } from './product-price';

describe('product-price', () => {
  describe('hasDiscount', () => {
    it('is false when discountValue is null', () => {
      expect(hasDiscount(makeProduct({ discountValue: null }))).toBe(false);
    });

    it('is false when discountValue is zero', () => {
      expect(hasDiscount(makeProduct({ discountValue: '0' }))).toBe(false);
    });

    it('is true when discountValue is greater than zero', () => {
      expect(hasDiscount(makeProduct({ discountValue: '10' }))).toBe(true);
    });
  });

  describe('finalPrice', () => {
    it('returns the original price when there is no discount', () => {
      expect(finalPrice(makeProduct({ price: '1310', discountValue: null }))).toBe(1310);
    });

    it('applies the percentage discount', () => {
      expect(
        finalPrice(makeProduct({ price: '1000', discountType: 'PERCENT', discountValue: '41' })),
      ).toBe(590);
      expect(
        finalPrice(makeProduct({ price: '200', discountType: 'PERCENT', discountValue: '25' })),
      ).toBe(150);
    });
  });

  describe('isNew', () => {
    it('is true for a product added 5 days ago', () => {
      expect(isNew(makeProduct({ createdAt: daysAgo(5) }))).toBe(true);
    });

    it('is false for a product added 31 days ago', () => {
      expect(isNew(makeProduct({ createdAt: daysAgo(31) }))).toBe(false);
    });
  });

  describe('isOutOfStock', () => {
    it('is true when stock is zero', () => {
      expect(isOutOfStock(makeProduct({ stock: 0 }))).toBe(true);
    });

    it('is false when stock is positive', () => {
      expect(isOutOfStock(makeProduct({ stock: 1 }))).toBe(false);
    });
  });
});
