import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Fingerprint, MapPin, Package, ShoppingCart, Star, Trash2 } from 'lucide-react';
import { BiometricModal } from '../components/modals/BiometricModal';
import { CheckoutModal } from '../components/modals/CheckoutModal';
import { SuccessModal } from '../components/modals/SuccessModal';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { formatBs } from '../lib/format';
import { getCustomerName, setCustomerName } from '../lib/session';
import type { DeliveryType, Order, PaymentMethod } from '@shared/types';

const HIGH_VALUE_THRESHOLD = 500;

export function CartPage() {
  const { darkMode } = useTheme();
  const { cart, cartSubtotal, cartCount, rate, updateCartQty, placeOrder } = useStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('Av. Bolívar, Torre Empresarial Plaza, Piso 3');
  const [pickupBranch, setPickupBranch] = useState(
    'Sucursal Principal - Av. Bolívar (8:00 AM - 8:00 PM)',
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pagomovil');
  const [pmRef, setPmRef] = useState('');
  const [customerName, setCustomerNameState] = useState(getCustomerName());
  const [checkoutOpen, setCheckoutOpen] = useState(false);
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

  const onConfirmNameChange = (value: string) => {
    setCustomerNameState(value);
    setCustomerName(value);
  };

  const submitOrder = async () => {
    setSubmitting(true);
    try {
      const order = await placeOrder({
        customer: customerName,
        deliveryType,
        paymentMethod,
        address: buildAddress(),
      });
      setCheckoutOpen(false);
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
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Carrito & Checkout Pro</h2>
            <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Revisa tu selección, doble conversión USD/VES y pago seguro.
            </p>
          </div>
          <Link to="/" className="px-4 py-2 rounded-2xl border text-xs font-black hover:bg-slate-800 transition-colors">
            ← Seguir Comprando
          </Link>
        </div>

        <div className={`p-16 rounded-3xl border text-center space-y-4 w-full glass-panel ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
          <ShoppingCart className="w-16 h-16 mx-auto text-amber-500/50" />
          <h3 className="text-xl font-black">Tu carrito está vacío</h3>
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
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Carrito & Checkout Pro</h2>
          <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {cartCount} artículos · Doble conversión USD/VES y pago seguro.
          </p>
        </div>
        <Link to="/" className="px-4 py-2 rounded-2xl border text-xs font-black hover:bg-slate-800 transition-colors">
          ← Seguir Comprando
        </Link>
      </div>

      <div className={panelClass}>
        <h3 className="font-black text-base flex items-center gap-2">
          <Package className="w-5 h-5 text-amber-500" /> Componentes Seleccionados ({cartCount})
        </h3>

        <div className="divide-y divide-slate-800/40">
          {cart.map((item) => (
            <div key={item.id} className="py-4 flex items-center gap-3 sm:gap-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl border border-slate-700 shrink-0"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-black text-sm truncate">{item.name}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                      item.type === 'car' ? 'bg-blue-600/20 text-blue-400' : 'bg-amber-600/20 text-amber-500'
                    }`}
                  >
                    {item.type === 'car' ? 'Carro' : 'Moto'}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold text-slate-400">
                  <span>SKU: {item.sku}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 uppercase">
                    {item.category}
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3 h-3 fill-amber-500" /> {item.rating}
                  </span>
                </div>
                <div className="text-xs font-black text-amber-500">
                  ${item.price.toFixed(2)} USD <span className="font-bold text-amber-400">({formatBs(item.price, rate)} c/u)</span>
                </div>
                <div className={`text-[10px] font-bold ${item.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {item.stock > 0 ? `Disponible: ${item.stock} un.` : 'Agotado'}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
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
                <button
                  onClick={() => updateCartQty(item.id, -item.quantity)}
                  className="px-2 py-1 rounded-lg text-[10px] font-black text-rose-400 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Quitar
                </button>
                <div className="text-right">
                  <div className="font-black text-sm">${(item.price * item.quantity).toFixed(2)}</div>
                  <div className="text-[10px] font-bold text-amber-400">
                    {formatBs(item.price * item.quantity, rate)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RESUMEN COMPACTO */}
      <div className={panelClass}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:justify-between">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-8">
              <span className="text-slate-400">Subtotal Repuestos</span>
              <span className="font-black">${cartSubtotal.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-slate-400">Logística & Envío GPS</span>
              <span className="font-black">${deliveryFee.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between gap-8 text-lg border-t border-slate-800 pt-2">
              <span className="font-black">Total USD</span>
              <span className="font-black text-amber-400">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30">
              <span className="text-[10px] uppercase font-black text-amber-500 tracking-wider">
                Tasa de la Tienda:
              </span>
              <span className="font-black text-sm text-amber-400">{formatBs(cartTotal, rate)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 items-stretch sm:items-end">
            {needsBiometric && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-[11px] font-bold text-red-400 flex items-center gap-2 max-w-sm">
                <Fingerprint className="w-5 h-5 flex-shrink-0" />
                <span>Orden superior a $500 USD: Requiere autenticación biométrica passkey.</span>
              </div>
            )}
            <button
              onClick={() => setCheckoutOpen(true)}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-500/30 hover:opacity-95 transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 w-full sm:w-auto"
            >
              <MapPin className="w-4 h-4" /> Continuar al Checkout
            </button>
          </div>
        </div>
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        customerName={customerName}
        onCustomerNameChange={onConfirmNameChange}
        deliveryType={deliveryType}
        onDeliveryTypeChange={setDeliveryType}
        deliveryAddress={deliveryAddress}
        onDeliveryAddressChange={setDeliveryAddress}
        pickupBranch={pickupBranch}
        onPickupBranchChange={setPickupBranch}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        pmRef={pmRef}
        onPmRefChange={setPmRef}
        needsBiometric={needsBiometric}
        submitting={submitting}
        onConfirm={handleCheckout}
      />

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