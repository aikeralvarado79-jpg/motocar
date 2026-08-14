import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type {
  CartItem,
  DeliveryType,
  Order,
  PaymentMethod,
  Product,
  RateEntry,
  Stats,
  StockChange,
  Transaction,
} from '@shared/types';
import { api } from '../lib/api';
import { connectSocket } from '../lib/socket';
import { getCustomerId } from '../lib/session';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface PlaceOrderArgs {
  customer: string;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  address: string;
}

interface StoreContextValue {
  loading: boolean;
  products: Product[];
  orders: Order[];
  transactions: Transaction[];
  rate: number;
  rateHistory: RateEntry[];
  stats: Stats | null;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (product: Product) => void;
  updateCartQty: (id: string, delta: number) => void;
  clearCart: () => void;
  placeOrder: (args: PlaceOrderArgs) => Promise<Order>;
  refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { isAdmin, token } = useAuth();
  const { showToast } = useToast();
  const customerId = useMemo(() => getCustomerId(), []);

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rate, setRate] = useState(36.5);
  const [rateHistory, setRateHistory] = useState<RateEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const cartRef = useRef<CartItem[]>([]);
  const isAdminRef = useRef(isAdmin);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);
  useEffect(() => {
    isAdminRef.current = isAdmin;
  }, [isAdmin]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [productList, rates] = await Promise.all([api.products(), api.rates()]);
      setProducts(productList);
      setRate(rates.rate);
      setRateHistory(rates.history);

      if (isAdmin && token) {
        const [orderList, transactionList, adminStats] = await Promise.all([
          api.orders(),
          api.transactions(token),
          api.stats(token),
        ]);
        setOrders(orderList);
        setTransactions(transactionList);
        setStats(adminStats);
      } else {
        setOrders(await api.orders(customerId));
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, token, customerId, showToast]);

  // Sincronización en tiempo real con otros dispositivos
  useEffect(() => {
    const socket = connectSocket();

    const onProductCreated = (p: Product) =>
      setProducts((prev) => (prev.some((x) => x.id === p.id) ? prev : [p, ...prev]));
    const onProductUpdated = (p: Product) =>
      setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    const onProductDeleted = (id: string) => {
      setProducts((prev) => prev.filter((x) => x.id !== id));
      setCart((prev) => prev.filter((x) => x.id !== id));
    };
    const onStockChanged = (c: StockChange) =>
      setProducts((prev) => prev.map((p) => (p.id === c.productId ? { ...p, stock: c.stock } : p)));
    const onOrderCreated = (o: Order) => {
      if (isAdminRef.current || o.customerId === customerId) {
        setOrders((prev) => (prev.some((x) => x.id === o.id) ? prev : [o, ...prev]));
      }
    };
    const onOrderUpdated = (o: Order) =>
      setOrders((prev) => prev.map((x) => (x.id === o.id ? o : x)));
    const onTransactionCreated = (t: Transaction) => {
      if (isAdminRef.current) {
        setTransactions((prev) => (prev.some((x) => x.id === t.id) ? prev : [t, ...prev]));
      }
    };
    const onRateUpdated = (r: { rate: number; entry: RateEntry }) => {
      setRate(r.rate);
      setRateHistory((prev) => [r.entry, ...prev.filter((e) => e.date !== r.entry.date)]);
    };

    socket.on('product:created', onProductCreated);
    socket.on('product:updated', onProductUpdated);
    socket.on('product:deleted', onProductDeleted);
    socket.on('stock:changed', onStockChanged);
    socket.on('order:created', onOrderCreated);
    socket.on('order:updated', onOrderUpdated);
    socket.on('transaction:created', onTransactionCreated);
    socket.on('rate:updated', onRateUpdated);

    void refresh();

    return () => {
      socket.off('product:created', onProductCreated);
      socket.off('product:updated', onProductUpdated);
      socket.off('product:deleted', onProductDeleted);
      socket.off('stock:changed', onStockChanged);
      socket.off('order:created', onOrderCreated);
      socket.off('order:updated', onOrderUpdated);
      socket.off('transaction:created', onTransactionCreated);
      socket.off('rate:updated', onRateUpdated);
    };
  }, [refresh, customerId]);

  const addToCart = useCallback(
    (product: Product) => {
      const current = cartRef.current;
      const existing = current.find((i) => i.id === product.id);
      const currentQty = existing?.quantity ?? 0;
      if (currentQty >= product.stock) {
        showToast(`Stock insuficiente para ${product.name}`, 'error');
        return;
      }
      setCart(
        existing
          ? current.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
          : [...current, { ...product, quantity: 1 }],
      );
      showToast(`¡${product.name} añadido al carrito!`, 'success');
    },
    [showToast],
  );

  const updateCartQty = useCallback(
    (id: string, delta: number) => {
      const current = cartRef.current;
      const item = current.find((i) => i.id === id);
      if (!item) return;
      const newQty = item.quantity + delta;
      if (newQty > item.stock) {
        showToast(`Stock máximo disponible: ${item.stock} un.`, 'error');
        return;
      }
      if (newQty < 1) {
        setCart(current.filter((i) => i.id !== id));
        return;
      }
      setCart(current.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)));
    },
    [showToast],
  );

  const clearCart = useCallback(() => setCart([]), []);

  const placeOrder = useCallback(
    async (args: PlaceOrderArgs): Promise<Order> => {
      const result = await api.createOrder({
        customerId,
        customer: args.customer,
        items: cartRef.current.map((i) => ({ productId: i.id, qty: i.quantity })),
        deliveryType: args.deliveryType,
        paymentMethod: args.paymentMethod,
        address: args.address,
      });
      result.stockChanges.forEach((change) =>
        setProducts((prev) =>
          prev.map((p) => (p.id === change.productId ? { ...p, stock: change.stock } : p)),
        ),
      );
      setCart([]);
      return result.order;
    },
    [customerId],
  );

  const cartCount = useMemo(() => cart.reduce((a, b) => a + b.quantity, 0), [cart]);
  const cartSubtotal = useMemo(() => cart.reduce((a, b) => a + b.price * b.quantity, 0), [cart]);

  return (
    <StoreContext.Provider
      value={{
        loading,
        products,
        orders,
        transactions,
        rate,
        rateHistory,
        stats,
        cart,
        cartCount,
        cartSubtotal,
        addToCart,
        updateCartQty,
        clearCart,
        placeOrder,
        refresh,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>');
  return ctx;
}
