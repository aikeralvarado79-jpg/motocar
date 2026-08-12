import fs from 'node:fs';
import path from 'node:path';
import type {
  Database,
  DeliveryType,
  Order,
  OrderCreationResult,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductInput,
  RateEntry,
  Stats,
  Transaction,
} from '../../shared/types';
import { config } from './config';
import { seedDatabase } from './seed';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface CreateOrderArgs {
  customerId: string;
  customer: string;
  items: Array<{ productId: string; qty: number }>;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  address: string;
}

export class Store {
  private db: Database;

  constructor(private readonly file: string) {
    this.db = this.load();
  }

  private load(): Database {
    try {
      if (fs.existsSync(this.file)) {
        const raw = fs.readFileSync(this.file, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<Database>;
        const base = seedDatabase();
        return {
          ...base,
          ...parsed,
          counters: { ...base.counters, ...(parsed.counters ?? {}) },
        };
      }
    } catch (err) {
      console.error('No se pudo leer la base de datos; se usarán los datos iniciales.', err);
    }
    const fresh = seedDatabase();
    this.persist(fresh);
    return fresh;
  }

  private persist(db: Database): void {
    try {
      fs.mkdirSync(path.dirname(this.file), { recursive: true });
      const tmp = `${this.file}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf-8');
      fs.renameSync(tmp, this.file);
    } catch (err) {
      console.error('Error al guardar la base de datos:', err);
    }
  }

  save(): void {
    this.persist(this.db);
  }

  get rate(): number {
    return this.db.rate;
  }

  private nextId(prefix: 'P' | 'ORD' | 'TRX'): string {
    if (prefix === 'P') return `P-${++this.db.counters.product}`;
    if (prefix === 'ORD') return `ORD-${++this.db.counters.order}`;
    return `TRX-${++this.db.counters.transaction}`;
  }

  // ---- Productos ----------------------------------------------------------

  listProducts(): Product[] {
    return structuredClone(this.db.products);
  }

  createProduct(input: ProductInput): Product {
    const product: Product = {
      id: this.nextId('P'),
      ...input,
      rating: 4.9,
      badge: 'Pro Elite',
    };
    this.db.products.unshift(product);
    this.save();
    return structuredClone(product);
  }

  updateProduct(id: string, input: ProductInput): Product | undefined {
    const index = this.db.products.findIndex((p) => p.id === id);
    if (index === -1) return undefined;
    const existing = this.db.products[index];
    const updated: Product = { ...existing, ...input, id };
    this.db.products[index] = updated;
    this.save();
    return structuredClone(updated);
  }

  deleteProduct(id: string): boolean {
    const before = this.db.products.length;
    this.db.products = this.db.products.filter((p) => p.id !== id);
    const deleted = this.db.products.length !== before;
    if (deleted) this.save();
    return deleted;
  }

  // ---- Pedidos ------------------------------------------------------------

  listOrders(opts: { all: boolean; customerId?: string }): Order[] {
    const sorted = [...this.db.orders].sort((a, b) => b.date.localeCompare(a.date));
    if (opts.all) return structuredClone(sorted);
    if (opts.customerId) {
      return structuredClone(sorted.filter((o) => o.customerId === opts.customerId));
    }
    return [];
  }

  createOrder(args: CreateOrderArgs): OrderCreationResult {
    if (!Array.isArray(args.items) || args.items.length === 0) {
      throw new ApiError(400, 'El pedido no puede estar vacío');
    }

    const details = args.items.map((item) => {
      const qty = Number(item.qty);
      if (!Number.isInteger(qty) || qty < 1) {
        throw new ApiError(400, 'Cantidad inválida en un artículo del pedido');
      }
      const product = this.db.products.find((p) => p.id === item.productId);
      if (!product) {
        throw new ApiError(400, 'Uno de los productos ya no existe en el catálogo');
      }
      if (product.stock < qty) {
        throw new ApiError(
          409,
          `Stock insuficiente para ${product.name} (disponible: ${product.stock} un.)`,
        );
      }
      return { product, qty };
    });

    const subtotal = details.reduce((sum, d) => sum + d.product.price * d.qty, 0);
    const deliveryFee = args.deliveryType === 'delivery' ? 5 : 0;
    const total = subtotal + deliveryFee;
    const now = new Date();

    const order: Order = {
      id: this.nextId('ORD'),
      customerId: args.customerId || 'anon',
      customer: args.customer?.trim() || 'Cliente',
      items: details.map((d) => ({
        productId: d.product.id,
        name: d.product.name,
        qty: d.qty,
        price: d.product.price,
      })),
      total,
      status: args.paymentMethod === 'pagomovil' ? 'pago_en_revision' : 'en_preparacion',
      paymentMethod:
        args.paymentMethod === 'pagomovil'
          ? 'Pago Móvil / Zelle'
          : args.paymentMethod === 'credito'
            ? 'Crédito Inmediato'
            : 'Efectivo en Tienda',
      deliveryType: args.deliveryType,
      address: args.address || 'Por confirmar',
      date: now.toISOString().replace('T', ' ').substring(0, 16),
      driver: 'Carlos "Turbo" Silva',
      eta: '22 mins',
    };

    this.db.orders.unshift(order);

    const transaction: Transaction = {
      id: this.nextId('TRX'),
      type: 'income',
      category: 'Venta de Repuestos Pro',
      amount: total,
      date: now.toISOString().substring(0, 10),
      ref: `Pedido #${order.id}`,
    };
    this.db.transactions.unshift(transaction);

    const stockChanges = details.map((d) => {
      d.product.stock -= d.qty;
      return { productId: d.product.id, stock: d.product.stock };
    });

    this.save();
    return {
      order: structuredClone(order),
      transaction: structuredClone(transaction),
      stockChanges,
    };
  }

  setOrderStatus(id: string, status: OrderStatus): Order | undefined {
    const order = this.db.orders.find((o) => o.id === id);
    if (!order) return undefined;
    order.status = status;
    this.save();
    return structuredClone(order);
  }

  // ---- Transacciones ------------------------------------------------------

  listTransactions(): Transaction[] {
    return structuredClone(this.db.transactions);
  }

  // ---- Tasa de cambio -----------------------------------------------------

  listRateHistory(): RateEntry[] {
    return structuredClone(this.db.rateHistory);
  }

  setRate(rate: number, author: string): { rate: number; entry: RateEntry } {
    const entry: RateEntry = {
      date: new Date().toISOString().substring(0, 10),
      rate,
      author: author || 'Admin',
    };
    this.db.rate = rate;
    this.db.rateHistory = [entry, ...this.db.rateHistory];
    this.save();
    return { rate, entry };
  }

  // ---- Estadísticas -------------------------------------------------------

  computeStats(): Stats {
    const monthPrefix = new Date().toISOString().substring(0, 7);
    const monthTx = this.db.transactions.filter((t) => t.date.startsWith(monthPrefix));
    const monthIncome = monthTx
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const monthExpenses = monthTx
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const netMargin = monthIncome > 0 ? ((monthIncome - monthExpenses) / monthIncome) * 100 : 0;
    const pendingOrders = this.db.orders.filter(
      (o) => o.status !== 'entregado' && o.status !== 'cancelado',
    ).length;
    const totalStock = this.db.products.reduce((s, p) => s + p.stock, 0);

    return {
      monthIncome,
      monthExpenses,
      netMargin,
      pendingOrders,
      totalStock,
      totalProducts: this.db.products.length,
      salesCount: this.db.orders.length,
      rate: this.db.rate,
    };
  }
}

/** Instancia única del almacén de datos, compartida por todas las rutas. */
export const store = new Store(config.dataFile);
