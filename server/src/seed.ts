import type {
  Database,
  Order,
  Product,
  RateEntry,
  Transaction,
} from '../../shared/types';

export const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800';

function daysAgo(n: number, withTime = false): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return withTime
    ? d.toISOString().replace('T', ' ').substring(0, 16)
    : d.toISOString().substring(0, 10);
}

export function seedDatabase(): Database {
  const products: Product[] = [
    {
      id: 'P-1',
      name: 'Pastillas de Freno Cerámicas Pro-Carbon',
      sku: 'BRAKE-001',
      type: 'car',
      category: 'frenos',
      price: 48.0,
      stock: 24,
      image:
        'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800',
      desc: 'Compuesto cerámico de competición con tecnología antiruido de última generación para frenado milimétrico.',
      rating: 4.9,
      badge: 'Más Vendido',
    },
    {
      id: 'P-2',
      name: 'Amortiguador Monoshock Invertido Gas',
      sku: 'SUSP-102',
      type: 'car',
      category: 'suspensión',
      price: 120.5,
      stock: 12,
      image:
        'https://images.unsplash.com/photo-1552934063-23910f545a27?auto=format&fit=crop&q=80&w=800',
      desc: 'Sistema hidráulico presurizado con nitrógeno para estabilidad extrema en curvas cerradas y terrenos difíciles.',
      rating: 4.7,
      badge: 'Alta Demanda',
    },
    {
      id: 'P-3',
      name: 'Kit de Embrague de Kevlar Reforzado',
      sku: 'TRAN-205',
      type: 'car',
      category: 'transmisión',
      price: 165.0,
      stock: 8,
      image:
        'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800',
      desc: 'Discos con fibra de Kevlar y plato de alta presión para soportar torque extremo sin deslizamiento.',
      rating: 5.0,
      badge: 'Competencia',
    },
    {
      id: 'P-4',
      name: 'Bujía de Iridio Racing NGK IX',
      sku: 'ELEC-301',
      type: 'moto',
      category: 'eléctrico',
      price: 14.0,
      stock: 65,
      image:
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
      desc: 'Chispa concentrada de alta intensidad para una combustión perfecta y respuesta instantánea del acelerador.',
      rating: 5.0,
      badge: 'Top Moto',
    },
    {
      id: 'P-5',
      name: 'Cadena Gold O-Ring 520 Racing',
      sku: 'TRAN-410',
      type: 'moto',
      category: 'transmisión',
      price: 72.0,
      stock: 19,
      image:
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800',
      desc: 'Aleación dorada anti-estiramiento con retenes de nitrilo para máxima duración bajo lluvia y polvo.',
      rating: 4.8,
      badge: 'Premium',
    },
    {
      id: 'P-6',
      name: 'Filtro de Aceite Magnético High-Flow',
      sku: 'ENG-502',
      type: 'car',
      category: 'motor',
      price: 16.5,
      stock: 40,
      image:
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800',
      desc: 'Imán de neodimio integrado que atrapa micro-partículas metálicas antes de que dañen los cilindros.',
      rating: 4.9,
      badge: 'Recomendado',
    },
    {
      id: 'P-7',
      name: 'Batería de Gel Libre Mantenimiento 12V',
      sku: 'ELEC-612',
      type: 'moto',
      category: 'eléctrico',
      price: 42.0,
      stock: 15,
      image:
        'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800',
      desc: 'Potencia de arranque en frío superior con electrolito en gel antivibraciones.',
      rating: 4.6,
      badge: 'Garantía 1 Año',
    },
    {
      id: 'P-8',
      name: 'Kit de Arrastre Titanio Pro',
      sku: 'TRAN-701',
      type: 'moto',
      category: 'transmisión',
      price: 98.0,
      stock: 10,
      image:
        'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&q=80&w=800',
      desc: 'Piñón de acero templado y corona aligerada para menor peso rotacional.',
      rating: 4.9,
      badge: 'Nuevo',
    },
  ];

  const orders: Order[] = [
    {
      id: 'ORD-501',
      customerId: 'cust-demo-1',
      customer: 'Carlos Mendoza',
      items: [{ productId: 'P-1', name: 'Pastillas de Freno Cerámicas Pro-Carbon', qty: 2, price: 48 }],
      total: 101,
      status: 'en_envio',
      paymentMethod: 'Pago Móvil / Zelle',
      deliveryType: 'delivery',
      address: 'Av. Francisco de Miranda, Torre Este, Piso 4',
      date: daysAgo(1, true),
      driver: 'José "El Rayo" Pérez',
      eta: '18 mins',
    },
    {
      id: 'ORD-502',
      customerId: 'cust-demo-2',
      customer: 'Mariana Gomez',
      items: [{ productId: 'P-3', name: 'Kit de Embrague de Kevlar Reforzado', qty: 1, price: 165 }],
      total: 165,
      status: 'en_preparacion',
      paymentMethod: 'Crédito Inmediato',
      deliveryType: 'pickup',
      address: 'Retiro en: Sucursal Principal - Centro (Abierto hasta las 8 PM)',
      date: daysAgo(2, true),
    },
  ];

  const transactions: Transaction[] = [
    {
      id: 'TRX-1001',
      type: 'income',
      category: 'Venta de Repuestos',
      amount: 235,
      date: daysAgo(2),
      ref: 'Pedido #ORD-501',
    },
    {
      id: 'TRX-1002',
      type: 'income',
      category: 'Venta de Repuestos',
      amount: 150,
      date: daysAgo(2),
      ref: 'Pedido #ORD-502',
    },
    {
      id: 'TRX-1003',
      type: 'expense',
      category: 'Compra de Mercancía',
      amount: 1200,
      date: daysAgo(9),
      ref: 'Factura Proveedor #884',
    },
    {
      id: 'TRX-1004',
      type: 'expense',
      category: 'Logística y Envíos',
      amount: 85,
      date: daysAgo(6),
      ref: 'Flota Moto Express',
    },
  ];

  const rateHistory: RateEntry[] = [
    { date: daysAgo(0), rate: 36.5, author: 'Admin Principal' },
    { date: daysAgo(1), rate: 36.2, author: 'Admin Principal' },
  ];

  return {
    products,
    orders,
    transactions,
    rate: 36.5,
    rateHistory,
    counters: { product: 8, order: 502, transaction: 1004 },
  };
}
