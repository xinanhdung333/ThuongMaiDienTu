import axios, { AxiosError, AxiosInstance } from 'axios';
import type {
  User,
  Address,
  Shop,
  Product,
  ProductVariant,
  ProductImage,
  Voucher,
  Order,
  OrderWithDetails,
  OrderItem,
  Payment,
  Shipment,
  ProductReview,
  Notification,
} from '@/types';

interface Promotion {
  promotion_id: string;
  promotion_name: string;
  description?: string;
  discount_type: 'PERCENT' | 'FIXED';
  discount_value: number;
  start_at: string;
  end_at: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const API_TOKEN_KEY = 'shopeelite_token';

const createApiClient = (): AxiosInstance => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
  const instance = axios.create({
    baseURL,
    timeout: 120000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem(API_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response) {
        return Promise.reject(error.response.data || error.response.statusText);
      }
      return Promise.reject(error.message);
    },
  );

  return instance;
};

const client = createApiClient();

const setToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(API_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(API_TOKEN_KEY);
  }
};

const getToken = () => localStorage.getItem(API_TOKEN_KEY);

const auth = {
  login: async (email: string, password: string) => {
    const { data } = await client.post<{ access_token: string }>('/auth/login', { email, password });
    setToken(data.access_token);
    return data;
  },
  logout: () => {
    setToken(null);
  },
  register: async (payload: Partial<User> & { password: string }) => {
    const { data } = await client.post<User>('/users', payload);
    return data;
  },
};

const users = {
  getAll: async () => {
    const { data } = await client.get<User[]>('/users');
    return data;
  },
  getOne: async (id: string) => {
    const { data } = await client.get<User>(`/users/${id}`);
    return data;
  },
  update: async (id: string, payload: Partial<User>) => {
    const { data } = await client.patch<User>(`/users/${id}`, payload);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await client.delete<User>(`/users/${id}`);
    return data;
  },
  assignRole: async (id: string, role: string) => {
    const { data } = await client.post<User>(`/users/${id}/roles`, { role });
    return data;
  },
  removeRole: async (id: string, role: string) => {
    const { data } = await client.delete<User>(`/users/${id}/roles`, { data: { role } });
    return data;
  },
  addAddress: async (id: string, payload: Omit<Address, 'address_id' | 'user_id' | 'created_at'>) => {
    const { data } = await client.post<Address>(`/users/${id}/addresses`, payload);
    return data;
  },
};

const shops = {
  list: async () => {
    const { data } = await client.get<Shop[]>('/shops');
    return data;
  },
  get: async (id: string) => {
    const { data } = await client.get<Shop>(`/shops/${id}`);
    return data;
  },
  create: async (payload: Partial<Shop>) => {
    const { data } = await client.post<Shop>('/shops', payload);
    return data;
  },
  update: async (id: string, payload: Partial<Shop>) => {
    const { data } = await client.patch<Shop>(`/shops/${id}`, payload);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await client.delete<Shop>(`/shops/${id}`);
    return data;
  },
};

const products = {
  list: async (params?: Record<string, any>) => {
    const { data } = await client.get<Product[]>('/products', { params });
    return data;
  },
  get: async (id: string) => {
    const { data } = await client.get<Product>(`/products/${id}`);
    return data;
  },
  create: async (payload: Partial<Product>) => {
    const { data } = await client.post<Product>('/products', payload);
    return data;
  },
  update: async (id: string, payload: Partial<Product>) => {
    const { data } = await client.patch<Product>(`/products/${id}`, payload);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await client.delete<Product>(`/products/${id}`);
    return data;
  },
  addImage: async (productId: string, image_url: string) => {
    const { data } = await client.post<ProductImage>(`/products/${productId}/images`, { image_url });
    return data;
  },
  addVariant: async (productId: string, payload: Partial<ProductVariant>) => {
    const { data } = await client.post<ProductVariant>(`/products/${productId}/variants`, payload);
    return data;
  },
  updateVariant: async (productId: string, variantId: string, payload: Partial<ProductVariant>) => {
    const { data } = await client.patch<ProductVariant>(`/products/${productId}/variants/${variantId}`, payload);
    return data;
  },
  removeVariant: async (productId: string, variantId: string) => {
    const { data } = await client.delete<ProductVariant>(`/products/${productId}/variants/${variantId}`);
    return data;
  },
  updateInventory: async (productId: string, variantId: string, quantity: number) => {
    const { data } = await client.patch(`/products/${productId}/variants/${variantId}/inventory`, { quantity });
    return data;
  },
};

const carts = {
  get: async (userId: string) => {
    const { data } = await client.get(`/carts/${userId}`);
    return data;
  },
  addItem: async (userId: string, variant_id: string, quantity: number) => {
    const { data } = await client.post(`/carts/${userId}/items`, { variant_id, quantity });
    return data;
  },
  updateItem: async (userId: string, itemId: string, quantity: number) => {
    const { data } = await client.patch(`/carts/${userId}/items/${itemId}`, { quantity });
    return data;
  },
  removeItem: async (userId: string, itemId: string) => {
    const { data } = await client.delete(`/carts/${userId}/items/${itemId}`);
    return data;
  },
  clear: async (userId: string) => {
    const { data } = await client.delete(`/carts/${userId}`);
    return data;
  },
};

const wishlist = {
  get: async (userId: string) => {
    const { data } = await client.get(`/wishlist/${userId}`);
    return data;
  },
  toggle: async (userId: string, product_id: string) => {
    const { data } = await client.post(`/wishlist/${userId}`, { product_id });
    return data;
  },
  remove: async (userId: string, productId: string) => {
    const { data } = await client.delete(`/wishlist/${userId}/${productId}`);
    return data;
  },
};

const orders = {
  list: async (userId?: string) => {
    const params = userId ? { user_id: userId } : undefined;
    const { data } = await client.get<OrderWithDetails[]>('/orders', { params });
    return data;
  },
  get: async (id: string) => {
    const { data } = await client.get<OrderWithDetails>(`/orders/${id}`);
    return data;
  },
  create: async (payload: Partial<Order> & { items: Array<Partial<OrderItem>> }) => {
    const { data } = await client.post<Order>('/orders', payload);
    return data;
  },
  updateStatus: async (id: string, status: string) => {
    const { data } = await client.patch<Order>(`/orders/${id}/status`, { status });
    return data;
  },
  createMoMo: async (id: string, payload: { orderInfo?: string }) => {
    const { data } = await client.post<any>(`/orders/${id}/momo-create`, payload);
    return data;
  },
  addShipment: async (groupId: string, payload: Partial<Shipment>) => {
    const { data } = await client.post<Shipment>(`/orders/groups/${groupId}/shipments`, payload);
    return data;
  },
};

const vouchersApi = {
  list: async (shop_id?: string) => {
    const params = shop_id ? { shop_id } : undefined;
    const { data } = await client.get<Voucher[]>('/vouchers', { params });
    return data;
  },
  get: async (id: string) => {
    const { data } = await client.get<Voucher>(`/vouchers/${id}`);
    return data;
  },
  create: async (payload: Partial<Voucher>) => {
    const { data } = await client.post<Voucher>('/vouchers', payload);
    return data;
  },
  update: async (id: string, payload: Partial<Voucher>) => {
    const { data } = await client.patch<Voucher>(`/vouchers/${id}`, payload);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await client.delete<Voucher>(`/vouchers/${id}`);
    return data;
  },
};

const reviews = {
  list: async (product_id?: string) => {
    const params = product_id ? { product_id } : undefined;
    const { data } = await client.get<ProductReview[]>('/reviews', { params });
    return data;
  },
  get: async (id: string) => {
    const { data } = await client.get<ProductReview>(`/reviews/${id}`);
    return data;
  },
  create: async (payload: Partial<ProductReview>) => {
    const { data } = await client.post<ProductReview>('/reviews', payload);
    return data;
  },
  update: async (id: string, payload: Partial<ProductReview>) => {
    const { data } = await client.patch<ProductReview>(`/reviews/${id}`, payload);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await client.delete<ProductReview>(`/reviews/${id}`);
    return data;
  },
};

const notifications = {
  list: async (recipient_id: string) => {
    const { data } = await client.get<Notification[]>('/notifications', { params: { recipient_id } });
    return data;
  },
  create: async (payload: Partial<Notification>) => {
    const { data } = await client.post<Notification>('/notifications', payload);
    return data;
  },
  markRead: async (id: string) => {
    const { data } = await client.patch<Notification>(`/notifications/${id}/read`);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await client.delete<Notification>(`/notifications/${id}`);
    return data;
  },
};

const promotions = {
  list: async () => {
    const { data } = await client.get<Promotion[]>('/promotions');
    return data;
  },
  active: async () => {
    const { data } = await client.get<Promotion[]>('/promotions/active');
    return data;
  },
  get: async (id: string) => {
    const { data } = await client.get<Promotion>(`/promotions/${id}`);
    return data;
  },
  create: async (payload: Partial<Promotion>) => {
    const { data } = await client.post<Promotion>('/promotions', payload);
    return data;
  },
  update: async (id: string, payload: Partial<Promotion>) => {
    const { data } = await client.patch<Promotion>(`/promotions/${id}`, payload);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await client.delete<Promotion>(`/promotions/${id}`);
    return data;
  },
};

export const api = {
  client,
  auth,
  users,
  shops,
  products,
  carts,
  wishlist,
  orders,
  vouchers: vouchersApi,
  reviews,
  notifications,
  promotions,
  setToken,
  getToken,
};
