import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  DollarSign,
  Fingerprint,
  MapPin,
  Package,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  Zap,
} from 'lucide-react';
import { BiometricModal } from '../components/modals/BiometricModal';
import { SuccessModal } from '../components/modals/SuccessModal';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { formatBs, PAYMENT_METHOD_LABELS } from '../lib/format';
import { getCustomerName, setCustomerName } from '../lib/session';
import type { Order, PaymentMethod } from '@shared/types';

const HIGH_VALUE_THRESHOLD = 500;

export function CartPage() {
  const { darkMode } = useTheme();
  const { cart, cartSubtotal, cartCount, rate, updateCartQty, placeOrder } = useStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('Av. Bolívar, Torre Empresarial Plaza, Piso 3');
  const [pickupBranch, setPickupBranch] = useState(
    'Sucursal Principal - Av. Bolívar (8:00 AM - 8:00 PM)',
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pagomovil');
  const [pmRef, setPmRef] = useState('');
  const [customerName, setCustomerNameState] = useState(getCustomerName());
  const [biometricOpen, setBiometricOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const deliveryFee = deliveryType === 'delivery' ? 5 : 0;
  const cartTotal = cartSubtotal + deliveryFee;
  const needsBiometric = cartTotal > HIGH_VALUE_THRESHOLD;

  const buildAddress = () =>
    deliveryType === 'delivery'
      ? deliveryAddress.trim() || 'Sin dirección especificada'
      : `Retiro en: ${pickupBranch}`;

  const submitOrder = async () => {
    if (paymentMethod === 'pagomovil' && !pmRef.trim()) {
      showToast('Por favor ingresa la referencia bancaria oficial', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const order = await placeOrder({
        customer: customerName,
        deliveryType,
        paymentMethod,
        address: buildAddress(),
      });
      setSuccessOrder(order);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo emitir el pedido', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = () => {
    if (needsBiometric) {
      setBiometricOpen(true);
      return;
    }
    void submitOrder();
  };

  const panelClass = `p-5 sm:p-6 rounded-3xl border space-y-5 glass-panel ${
    darkMode ? 'bg-slate-900/80 border-slate-800 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-xl'
  }`;

  if (cart.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Garaje & Checkout Pro</h2>
            <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Revisa tu selección, doble conversión USD/VES y pago seguro.
            </p>
          </div>
          <Link to="/" className="px-4 py-2 rounded-2xl border text-xs font-black hover:bg-slate-800 transition-colors">
            ← Seguir Comprando
          </Link>
        </div>

        <div className={`p-16 rounded-3xl border text-center space-y-4 w-full glass-panel ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
          <ShoppingBag className="w-16 h-16 mx-auto text-amber-500/50" />
          <h3 className="text-xl font-black">Tu garaje está vacío</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No hay repuestos en tu orden actual. Explora el catálogo y añade componentes de alto rendimiento.
          </p>
          <Link
            to="/"
            className="inline-block px-8 py-3.5 bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/30"
          >
            Explorar Catálogo Pro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Garaje & Checkout Pro</h2>
          <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {cartCount} artículos · Doble conversión USD/VES y pago seguro.
          </p>
        </div>
        <Link to="/" className="px-4 py-2 rounded-2xl border text-xs font-black hover:bg-slate-800 transition-colors">
          ← Seguir Comprando
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        <div className="lg:col-span-2 space-y-6">
          {/* LISTA DE ARTÍCULOS */}
          <div className={panelClass}>
            <h3 className="font-black text-base flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" /> Componentes Seleccionados ({cartCount})
            </h3>

            <div className="divide-y divide-slate-800/40">
              {cart.map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-2xl border border-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-sm truncate">{item.name}</h4>
                    <div className="text-xs font-black text-amber-500">
                      ${item.price.toFixed(2)} USD ({formatBs(item.price, rate)} c/u)
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                    <button
                      onClick={() => updateCartQty(item.id, -1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-black text-xs"
                      aria-label="Disminuir cantidad"
                    >
                      -
                    </button>
                    <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQty(item.id, 1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-black text-xs"
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right min-w-[90px]">
                    <div className="font-black text-sm">${(item.price * item.quantity).toFixed(2)}</div>
                    <div className="text-[10px] font-bold text-amber-400">
                      {formatBs(item.price * item.quantity, rate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NOMBRE DEL CLIENTE */}
          <div className={panelClass}>
            <h3 className="font-black text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" /> Datos del Cliente
            </h3>
            <input
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerNameState(e.target.value);
                setCustomerName(e.target.value);
              }}
              placeholder="Tu nombre para el pedido"
              className={`w-full p-3.5 rounded-2xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200'
              }`}
            />
          </div>

          {/* MÉTODO DE ENTREGA */}
          <div className={panelClass}>
            <h3 className="font-black text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" /> 1. Método de Entrega & GPS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col gap-2 transition-all duration-200 glass-panel ${
                  deliveryType === 'delivery'
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                    : darkMode
                      ? 'border-slate-800 bg-slate-950/40'
                      : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs uppercase tracking-wider flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-500" /> Envío a Domicilio
                  </span>
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryType === 'delivery'}
                    onChange={() => setDeliveryType('delivery')}
                    className="accent-amber-500"
                  />
                </div>
                <p className="text-xs text-slate-400">Rastreo satelital en vivo con motorizado Pro ($5.00)</p>
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col gap-2 transition-all duration-200 glass-panel ${
                  deliveryType === 'pickup'
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                    : darkMode
                      ? 'border-slate-800 bg-slate-950/40'
                      : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs uppercase tracking-wider flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-500" /> Retiro en Tienda
                  </span>
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryType === 'pickup'}
                    onChange={() => setDeliveryType('pickup')}
                    className="accent-amber-500"
                  />
                </div>
                <p className="text-xs text-slate-400">Retira gratis en sucursal con código QR al instante</p>
              </label>
            </div>

            {deliveryType === 'delivery' ? (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-black uppercase tracking-wider">Dirección de Destino</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className={`w-full p-3.5 rounded-2xl border text-xs font-semibold ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                />
                <div className="h-40 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center animate-bounce shadow-lg shadow-amber-500/50">
                      <MapPin className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-900/90 text-amber-400 text-[10px] font-black border border-amber-500/30">
                      GPS Satelital Activo (Lat: 10.48, Lon: -66.90)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-black uppercase tracking-wider">Seleccionar Sucursal Autorizada</label>
                <select
                  value={pickupBranch}
                  onChange={(e) => setPickupBranch(e.target.value)}
                  className={`w-full p-3.5 rounded-2xl border text-xs font-semibold ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                >
                  <option value="Sucursal Principal - Av. Bolívar (8:00 AM - 8:00 PM)">
                    Sucursal Principal - Av. Bolívar (8:00 AM - 8:00 PM)
                  </option>
                  <option value="Sucursal Este - Las Mercedes (9:00 AM - 7:00 PM)">
                    Sucursal Este - Las Mercedes (9:00 AM - 7:00 PM)
                  </option>
                </select>
              </div>
            )}
          </div>

          {/* MÉTODO DE PAGO */}
          <div className={panelClass}>
            <h3 className="font-black text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" /> 2. Método de Pago Oficial & Tasa BCV
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(
                [
                  { id: 'pagomovil', label: PAYMENT_METHOD_LABELS.pagomovil, icon: QrCode },
                  { id: 'credito', label: PAYMENT_METHOD_LABELS.credito, icon: Zap },
                  { id: 'efectivo', label: PAYMENT_METHOD_LABELS.efectivo, icon: DollarSign },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPaymentMethod(id)}
                  className={`p-4 rounded-2xl border text-xs font-black uppercase tracking-wider flex flex-col items-center gap-2.5 transition-all duration-200 glass-panel ${
                    paymentMethod === id
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400 ring-2 ring-amber-500/30'
                      : darkMode
                        ? 'border-slate-800 bg-slate-950/40 text-slate-400 hover:bg-slate-800'
                        : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  {label}
                </button>
              ))}
            </div>

            {paymentMethod === 'pagomovil' && (
              <div className="p-5 rounded-2xl border bg-slate-950/80 border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-black text-amber-400 border-b border-slate-800 pb-3 gap-1">
                  <span>Datos Bancarios: Banco de Venezuela (0102)</span>
                  <span>RIF: J-40123456-8 | 0412-1234567</span>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5">
                    Número de Referencia Bancaria (6 Dígitos)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 489210"
                    value={pmRef}
                    onChange={(e) => setPmRef(e.target.value)}
                    className="w-full p-3 rounded-xl border bg-slate-900 border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RESUMEN */}
        <div className={panelClass + ' h-fit'}>
          <h3 className="font-black text-base border-b border-slate-800 pb-4">Resumen Financiero Dual</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Subtotal Repuestos</span>
              <span className="font-black">${cartSubtotal.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Logística & Envío GPS</span>
              <span className="font-black">${deliveryFee.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-4 text-lg">
              <span className="font-black">Total USD</span>
              <span className="font-black text-amber-400">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-1 bg-amber-500/10 p-3.5 rounded-2xl border border-amber-500/30">
              <span className="text-[10px] uppercase font-black text-amber-500 tracking-wider">
                Equivalente Oficial BCV ({rate.toFixed(2)} Bs/$):
              </span>
              <span className="font-black text-base text-amber-400">{formatBs(cartTotal, rate)}</span>
            </div>
          </div>

          {needsBiometric && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-[11px] font-bold text-red-400 flex items-center gap-2">
              <Fingerprint className="w-5 h-5 flex-shrink-0" />
              <span>Orden superior a $500 USD: Requiere autenticación biométrica passkey.</span>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-500/30 hover:opacity-95 transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
          >
            {needsBiometric ? <Fingerprint className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            {needsBiometric ? 'Validar con Biometría VIP' : submitting ? 'Procesando...' : 'Confirmar Orden Pro'}
          </button>
        </div>
      </div>

      <BiometricModal
        open={biometricOpen}
        onClose={() => setBiometricOpen(false)}
        onVerified={() => {
          setBiometricOpen(false);
          void submitOrder();
        }}
      />

      <SuccessModal
        order={successOrder}
        onClose={() => {
          setSuccessOrder(null);
          navigate('/orders');
        }}
      />
    </div>
  );
}
