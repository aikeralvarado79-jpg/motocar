import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ProductInput, VehicleType } from '../../../shared/types';
import { requireAdmin } from '../auth';
import { broadcast } from '../broadcast';
import { DEFAULT_IMAGE } from '../seed';
import { store } from '../store';

function isVehicleType(value: unknown): value is VehicleType {
  return value === 'car' || value === 'moto';
}

function sanitizeProductInput(body: unknown): ProductInput | null {
  const input = (body ?? {}) as Record<string, unknown>;
  const { name, sku, type, category, price, stock, image, desc } = input;

  if (typeof name !== 'string' || !name.trim()) return null;
  if (typeof sku !== 'string' || !sku.trim()) return null;
  if (!isVehicleType(type)) return null;
  if (typeof category !== 'string' || !category.trim()) return null;

  const parsedPrice = Number(price);
  const parsedStock = Number(stock);
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) return null;
  if (!Number.isInteger(parsedStock) || parsedStock < 0) return null;

  return {
    name: name.trim(),
    sku: sku.trim(),
    type,
    category: category.trim(),
    price: parsedPrice,
    stock: parsedStock,
    image: typeof image === 'string' && image.trim() ? image.trim() : DEFAULT_IMAGE,
    desc: typeof desc === 'string' ? desc.trim() : '',
  };
}

export function productsRouter(): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    res.json(store.listProducts());
  });

  router.post('/', requireAdmin, (req: Request, res: Response) => {
    const input = sanitizeProductInput(req.body);
    if (!input) {
      res.status(400).json({ error: 'Datos inválidos. Revisa los campos del repuesto.' });
      return;
    }
    const product = store.createProduct(input);
    broadcast('product:created', product);
    res.status(201).json(product);
  });

  router.put('/:id', requireAdmin, (req: Request, res: Response) => {
    const input = sanitizeProductInput(req.body);
    if (!input) {
      res.status(400).json({ error: 'Datos inválidos. Revisa los campos del repuesto.' });
      return;
    }
    const product = store.updateProduct(req.params.id, input);
    if (!product) {
      res.status(404).json({ error: 'Repuesto no encontrado' });
      return;
    }
    broadcast('product:updated', product);
    res.json(product);
  });

  router.delete('/:id', requireAdmin, (req: Request, res: Response) => {
    const deleted = store.deleteProduct(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Repuesto no encontrado' });
      return;
    }
    broadcast('product:deleted', req.params.id);
    res.json({ ok: true });
  });

  return router;
}
