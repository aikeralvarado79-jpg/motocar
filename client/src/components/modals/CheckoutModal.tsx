import { useEffect, useState } from 'react';
import type { DeliveryType, PaymentMethod } from '@shared/types';
import {
  ArrowLeft,
  ArrowRight,
  DollarSign,
  Fingerprint,
  MapPin,
  Package,
  QrCode,
  ShieldCheck,
  Store,
  Truck,
  Zap,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { formatBs, PAYMENT_METHOD_LABELS } from '../../lib/format';
import { Modal } from '../ui/Modal';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  customerName: string;
  onCustomerNameChange: (value: string) => void;
  deliveryType: DeliveryType;
  onDeliveryTypeChange: (value: DeliveryType) => void;
  deliveryAddress: string;
  onDeliveryAddressChange: (value: string) => void;
  pickupBranch: string;
  onPickupBranchChange: (value: string) => void;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (value: PaymentMethod) => void;
  pmRef: string;
  onPmRefChange: (value: string) => void;
  needsBiometric: boolean;
  submitting: boolean;
  onConfirm: () => void;
}

const STEPS = ['Datos & Entrega', 'Pago', 'Resumen'];

export function CheckoutModal({
  open,
  onClose,
  customerName,
  onCustomerNameChange,
  deliveryType,
  onDeliveryTypeChange,
  deliveryAddress,
  onDeliveryAddressChange,
  pickupBranch,
  onPickupBranchChange,
  paymentMethod,
  onPaymentMethodChange,
  pmRef,
  onPmRefChange,
  needsBiometric,
  submitting,
  onConfirm,
}: CheckoutModalProps) {
  const { darkMode } = useTheme();
  const { cart, cartSubtotal, rate } = useStore();
  const { showToast } = useToast();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const deliveryFee = deliveryType === 'delivery' ? 5 : 0;
  const cartTotal = cartSubtotal + deliveryFee;

  const panelClass = (dark: boolean) =>
    `p-4 rounded-2xl border space-y-4 ${dark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`;

  const next = () => {
    if (step === 1 && paymentMethod === 'pagomovil' && !pmRef.trim()) {
      showToast('Por favor ingresa la referencia bancaria oficial', 'error');
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));
  const close = () => {
    setStep(0);
    onClose();
  };

  return (
    <Modal open={open} onClose={close} maxWidth="max-w-lg">
      {/* Indicador de pasos */}
      <div className="flex items-center gap-2 mb-5">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1 flex items-center gap-2">
            <span
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                i <= step ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950' : darkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-400'
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`hidden sm:block text-[10px] font-black uppercase tracking-wider ${i <= step ? 'text-amber-500' : darkMode ? 'text-slate-500' : 'text-slate-400'}`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-amber-500' : darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      {/* PASO 1: DATOS Y ENTREGA */}
      {step === 0 && (
        <div className="space-y-4">
          <div className={panelClass(darkMode)}>
            <h3 className="font-black text-xs uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" /> Datos del Cliente
            </h3>
            <input
              type="text"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="Tu nombre para el pedido"
              className={`w-full p-3 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200'
              }`}
            />
          </div>

          <div className={panelClass(darkMode)}>
            <h3 className="font-black text-xs uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" /> Método de Entrega
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col gap-1.5 transition-all duration-200 ${
                  deliveryType === 'delivery'
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                    : darkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs uppercase tracking-wider flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-500" /> Envío
                  </span>
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryType === 'delivery'}
                    onChange={() => onDeliveryTypeChange('delivery')}
                    className="accent-amber-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Rastreo satelital con motorizado Pro ($5.00)</p>
              </label>

              <label
                className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col gap-1.5 transition-all duration-200 ${
                  deliveryType === 'pickup'
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                    : darkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs uppercase tracking-wider flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-500" /> Retiro
                  </span>
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryType === 'pickup'}
                    onChange={() => onDeliveryTypeChange('pickup')}
                    className="accent-amber-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Retira gratis en tienda con código QR</p>
              </label>
            </div>

            {deliveryType === 'delivery' ? (
              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider">Dirección de Destino</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => onDeliveryAddressChange(e.target.value)}
                  className={`w-full p-3 rounded-xl border text-xs font-semibold ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
                />
                <div className="h-28 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center animate-bounce">
                      <MapPin className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900/90 text-amber-400 text-[9px] font-black border border-amber-500/30">
                      GPS Satelital Activo (Lat: 10.48, Lon: -66.90)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider">Seleccionar Sucursal</label>
                <select
                  value={pickupBranch}
                  onChange={(e) => onPickupBranchChange(e.target.value)}
                  className={`w-full p-3 rounded-xl border text-xs font-semibold ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200'}`}
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
        </div>
      )}

      {/* PASO 2: PAGO */}
      {step === 1 && (
        <div className="space-y-4">
          <div className={panelClass(darkMode)}>
            <h3 className="font-black text-xs uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" /> Método de Pago Oficial
            </h3>

            <div className="grid grid-cols-3 gap-2">
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
                  onClick={() => onPaymentMethodChange(id)}
                  className={`p-3 sm:p-4 rounded-2xl border text-[10px] sm:text-xs font-black uppercase tracking-wider flex flex-col items-center gap-2 transition-all duration-200 ${
                    paymentMethod === id
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400 ring-2 ring-amber-500/30'
                      : darkMode ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  {label}
                </button>
              ))}
            </div>

            {paymentMethod === 'pagomovil' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-black text-amber-400 border-b border-slate-800 pb-2 gap-1">
                  <span>Banco de Venezuela (0102)</span>
                  <span>RIF: J-40123456-8 | 0412-1234567</span>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5">
                    Número de Referencia (6 Dígitos)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 489210"
                    value={pmRef}
                    onChange={(e) => onPmRefChange(e.target.value)}
                    className="w-full p-3 rounded-xl border bg-slate-900 border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PASO 3: RESUMEN Y CONFIRMAR */}
      {step === 2 && (
        <div className="space-y-4">
          <div className={panelClass(darkMode)}>
            <h3 className="font-black text-xs uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" /> Resumen de la Orden
            </h3>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-2.5 text-xs">
                  <img src={item.image} alt={item.name} className="w-9 h-9 object-cover rounded-lg border border-slate-700 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-black truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {item.quantity} × ${item.price.toFixed(2)} USD
                    </div>
                  </div>
                  <div className="font-black text-amber-400">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={panelClass(darkMode)}>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Subtotal Repuestos</span>
                <span className="font-black">${cartSubtotal.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Logística & Envío GPS</span>
                <span className="font-black">${deliveryFee.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-3 text-lg">
                <span className="font-black">Total USD</span>
                <span className="font-black text-amber-400">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex flex-col gap-0.5 bg-amber-500/10 p-3 rounded-xl border border-amber-500/30">
                <span className="text-[10px] uppercase font-black text-amber-500 tracking-wider">
                  Tasa de la Tienda ({rate.toFixed(2)} Bs/$):
                </span>
                <span className="font-black text-sm text-amber-400">{formatBs(cartTotal, rate)}</span>
              </div>
            </div>
          </div>

          {needsBiometric && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-[11px] font-bold text-red-400 flex items-center gap-2">
              <Fingerprint className="w-5 h-5 flex-shrink-0" />
              <span>Orden superior a $500 USD: Requiere autenticación biométrica passkey.</span>
            </div>
          )}
        </div>
      )}

      {/* Navegación entre pasos */}
      <div className="flex items-center gap-3 pt-6">
        <button
          onClick={back}
          disabled={step === 0}
          className="px-4 py-3 rounded-2xl border border-slate-700 text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Anterior
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
          >
            Siguiente <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onConfirm}
            disabled={submitting}
            className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/30 hover:opacity-95 transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 ${
              needsBiometric
                ? 'bg-gradient-to-r from-rose-600 to-red-700 text-white'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-slate-950'
            }`}
          >
            {needsBiometric ? <Fingerprint className="w-4 h-4" /> : null}
            {needsBiometric ? 'Validar con Biometría VIP' : submitting ? 'Procesando...' : 'Confirmar Orden Pro'}
          </button>
        )}
      </div>
    </Modal>
  );
}