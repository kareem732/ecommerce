export interface OrderHistoryResponse {
  status: boolean;
  code: number;
  payload: {
    data: order[];
    metadata: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface order {
  id: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: string;
  discount: string;
  shipping: string;
  total: string;
  trackingNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  address: {
    id: string;
    title: string;
    city: string;
    street: string;
    phone: string;
  };
  orderItems: orderItem[];
}

export interface orderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: string;
  product: {
    id: string;
    title: string;
    cover: string;
  };
}