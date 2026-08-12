/**
 * Tipos compartidos entre el servidor (server) y el cliente (client).
 * Ruta en cliente:  import type { ... } from '@shared/types';
 * Ruta en servidor: import type { ... } from '../../shared/types';
 */

export type VehicleType = 'car' | 'moto';

export type OrderStatus =
  | 'pago_en_revision'
  | 'en_preparacion'
  | 'en_envio'
  | 'entregado'
  | 'cancelado';

export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'pagomovil' | 'credito' | 'efectivo';

export type DeliveryType = 'delivery' | 'pickup';

export interface Product {
  id: string;
  name: string;
  sku: string;
  type: VehicleType;
  category: string;
  price: number;
  stock: number;
  image: string;
  desc: string;
  rating: number;
  badge: string;
}

export interface ProductInput {
  name: string;
  sku: string;
  type: VehicleType;
  category: string;
  price: number;
  stock: number;
  image: string;
  desc: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  customer: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  deliveryType: DeliveryType;
  address: string;
  date: string;
  driver?: string;
  eta?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  ref: string;
}

export interface RateEntry {
  date: string;
  rate: number;
  author: string;
}

export interface Stats {
  monthIncome: number;
  monthExpenses: number;
  netMargin: number;
  pendingOrders: number;
  totalStock: number;
  totalProducts: number;
  salesCount: number;
  rate: number;
}

export interface Database {
  products: Product[];
  orders: Order[];
  transactions: Transaction[];
  rate: number;
  rateHistory: RateEntry[];
  counters: {
    product: number;
    order: number;
    transaction: number;
  };
}

export interface StockChange {
  productId: string;
  stock: number;
}

export interface OrderCreationResult {
  order: Order;
  transaction: Transaction;
  stockChanges: StockChange[];
}
