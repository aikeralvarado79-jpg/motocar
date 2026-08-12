/**
 * Cliente HTTP tipado para la API REST del servidor.
 */
import type {
  DeliveryType,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductInput,
  RateEntry,
  Stats,
  StockChange,
  Transaction,
} from '@shared/types';

const API_BASE = '/api';

export interface AuthUser {
  username: string;
  role: 'admin';
}

export interface CreateOrderPayload {
  customerId: string;
  customer: string;
  items: Array<{ productId: string; qty: number }>;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  address: string;
}

export interface OrderCreationResponse {
  order: Order;
  transaction: Transaction;
  stockChanges: StockChange[];
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor');
  }

  if (!res.ok) {
    let message = 'Error del servidor';
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      /* sin cuerpo legible */
    }
    throw new ApiError(res.status, message);
  }

  return (await res.json()) as T;
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: { username, password },
    }),
  logout: (token: string) => request<{ ok: boolean }>('/auth/logout', { method: 'POST', token }),
  me: (token: string) => request<{ user: AuthUser }>('/auth/me', { token }),

  // Productos
  products: () => request<Product[]>('/products'),
  createProduct: (input: ProductInput, token: string) =>
    request<Product>('/products', { method: 'POST', body: input, token }),
  updateProduct: (id: string, input: ProductInput, token: string) =>
    request<Product>(`/products/${id}`, { method: 'PUT', body: input, token }),
  deleteProduct: (id: string, token: string) =>
    request<{ ok: boolean }>(`/products/${id}`, { method: 'DELETE', token }),

  // Pedidos
  orders: (customerId?: string) =>
    request<Order[]>(`/orders${customerId ? `?customerId=${encodeURIComponent(customerId)}` : ''}`),
  createOrder: (payload: CreateOrderPayload) =>
    request<OrderCreationResponse>('/orders', {
      method: 'POST',
      body: payload,
    }),
  updateOrderStatus: (id: string, status: OrderStatus, token: string) =>
    request<Order>(`/orders/${id}/status`, { method: 'PATCH', body: { status }, token }),

  // Finanzas
  transactions: (token: string) => request<Transaction[]>('/transactions', { token }),
  stats: (token: string) => request<Stats>('/stats', { token }),

  // Tasas
  rates: () => request<{ rate: number; history: RateEntry[] }>('/rates'),
  updateRate: (rate: number, token: string) =>
    request<{ rate: number; entry: RateEntry }>('/rates', { method: 'PUT', body: { rate }, token }),
};
