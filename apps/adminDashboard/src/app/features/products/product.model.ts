export type ProductStatus = 'ACTIVE' | 'DRAFT';

export interface AdminProduct {
  id: string;
  title: string;
  imgCover: string;
  price: number;
  quantity: number;
  sold: number;
  category: { name: string };
  status: ProductStatus;
  createdAt: string;
}
