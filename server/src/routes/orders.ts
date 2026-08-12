import { Router } from 'express';
import type { Request, Response } from 'express';
import type { DeliveryType, OrderStatus, PaymentMethod } from '../../../shared/types';
import { isAuthenticated } from './auth';
import { requireAdmin } from '../auth';
import { broadcast } from '../broadcast';
import { ApiError, store } from '../store';

const PAYMENT_METHODS: PaymentMethod[] = ['pagomovil', 'credito', 'efectivo'];
const ORDER_STATUSES: OrderStatus[] = [
  'pago_en_revision',
  'en_preparacion',
  'en_envio',
  'entregado',
  'cancelado',
];

export function ordersRouter(): Router {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    const admin = isAuthenticated(req);
    const customerId = typeof req.query.customerId === 'string' ? req.query.customerId : undefined;
    res.json(store.listOrders({ all: admin, customerId }));
  });

  router.post('/', (req: Request, res: Response) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const items = body.items;

    if (!Array.isArray(items)) {
      res.status(400).json({ error: 'El pedido debe incluir artículos' });
      return;
    }

    const sanitizedItems = items.map((raw) => {
      const item = (raw ?? {}) as Record<string, unknown>;
      return {
        productId: typeof item.productId === 'string' ? item.productId : '',
        qty: Number(item.qty),
      };
    });

    const deliveryType =
      body.deliveryType === 'delivery' || body.deliveryType === 'pickup'
        ? (body.deliveryType as DeliveryType)
        : 'delivery';
    const paymentMethod = PAYMENT_METHODS.includes(body.paymentMethod as PaymentMethod)
      ? (body.paymentMethod as PaymentMethod)
      : 'pagomovil';

    const address =
      deliveryType === 'delivery'
        ? String(body.address ?? '').trim() || 'Sin dirección especificada'
        : `Retiro en: ${String(body.pickupBranch ?? 'Sucursal Principal').trim()}`;

    try {
      const result = store.createOrder({
        customerId: String(body.customerId ?? 'anon').trim(),
        customer: String(body.customer ?? 'Cliente').trim(),
        items: sanitizedItems,
        deliveryType,
        paymentMethod,
        address,
      });

      broadcast('order:created', result.order);
      broadcast('transaction:created', result.transaction);
      result.stockChanges.forEach((change) => {
        broadcast('stock:changed', change);
      });

      res.status(201).json({
        order: result.order,
        transaction: result.transaction,
        stockChanges: result.stockChanges,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      throw err;
    }
  });

  router.patch('/:id/status', requireAdmin, (req: Request, res: Response) => {
    const status = req.body?.status as OrderStatus;
    if (!ORDER_STATUSES.includes(status)) {
      res.status(400).json({ error: 'Estado de pedido inválido' });
      return;
    }
    const order = store.setOrderStatus(req.params.id, status);
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }
    broadcast('order:updated', order);
    res.json(order);
  });

  return router;
}
