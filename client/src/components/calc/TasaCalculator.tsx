import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDownUp, Calculator, Maximize2, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import { formatAmountValue, maskAmount, parseAmount } from '../../lib/calc';
import { Modal } from '../ui/Modal';

type View = 'closed' | 'mini' | 'full';
type Currency = 'usd' | 'bs';
type Operator = '+' | '-' | '*' | '/';

const OP_SYMBOL: Record<Operator, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' };

function operate(a: number, o: Operator, b: number): number {
  switch (o) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return b === 0 ? NaN : a / b;
  }
}

interface FieldProps {
  label: string;
  prefix: string;
  prefixClass: string;
  value: string;
  onChange: (v: string) => void;
  darkMode: boolean;
}

function AmountField({ label, prefix, prefixClass, value, onChange, darkMode }: FieldProps) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <div
        className={`mt-1.5 flex items-center gap-2 rounded-2xl border px-3.5 py-3 focus-within:ring-2 focus-within:ring-amber-500 transition-all ${
          darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <span className={`text-sm font-black ${prefixClass}`}>{prefix}</span>
        <input
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(maskAmount(e.target.value))}
          placeholder="0,00"
          className="w-full bg-transparent text-right text-2xl font-black tracking-tight outline-none placeholder:text-slate-500"
        />
      </div>
    </label>
  );
}

/* ------------------------------- MINI MODAL ------------------------------- */
function MiniModal({ rate, darkMode, onClose, onFull }: { rate: number; darkMode: boolean; onClose: () => void; onFull: () => void }) {
  const [usdStr, setUsdStr] = useState('');
  const [bsStr, setBsStr] = useState('');

  const syncFromUsd = (v: string) => {
    setUsdStr(v);
    const usd = parseAmount(v);
    setBsStr(usd > 0 ? formatAmountValue(usd * rate) : v === '' ? '' : '0');
  };
  const syncFromBs = (v: string) => {
    setBsStr(v);
    const bs = parseAmount(v);
    setUsdStr(bs > 0 ? formatAmountValue(bs / rate) : v === '' ? '' : '0');
  };

  return (
    <Modal open onClose={onClose} maxWidth="max-w-sm" title="Calculadora de Tasa">
      <div className="space-y-3">
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Tasa de la tienda</span>
          <span className="text-sm font-black text-amber-400">Bs. {rate.toFixed(2)}</span>
        </div>

        <AmountField label="Monto en Dólares (USD)" prefix="$" prefixClass="text-emerald-400" value={usdStr} onChange={syncFromUsd} darkMode={darkMode} />

        <div className="flex items-center justify-center -my-1">
          <span className="p-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500">
            <ArrowDownUp className="w-3.5 h-3.5" />
          </span>
        </div>

        <AmountField label="Monto en Bolívares (Bs)" prefix="Bs" prefixClass="text-amber-400" value={bsStr} onChange={syncFromBs} darkMode={darkMode} />

        <p className={`text-[10px] leading-relaxed ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Los miles se formatean automáticamente (1.000). Usa la coma (,) para escribir los decimales.
        </p>

        <button
          onClick={onFull}
          className={`w-full py-3 rounded-2xl border text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 ${
            darkMode ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Maximize2 className="w-4 h-4 text-amber-500" /> Calculadora Completa
        </button>
      </div>
    </Modal>
  );
}

/* ---------------------------- CALCULADORA FULL ---------------------------- */
function FullCalculator({ rate, darkMode, onClose }: { rate: number; darkMode: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<Currency>('usd');
  const [entry, setEntry] = useState('');
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<Operator | null>(null);
  const [fresh, setFresh] = useState(true);
  const [last, setLast] = useState<{ usd: number; bs: number } | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const parseEntryUsd = () => (mode === 'usd' ? parseAmount(entry) : parseAmount(entry) / rate);
  const entryVal = parseAmount(entry);
  const oppositeLabel =
    mode === 'usd' ? `Bs. ${formatAmountValue(entryVal * rate)}` : `$ ${formatAmountValue(entryVal / rate)}`;

  const pressDigit = (d: string) => {
    setLast(null);
    if (fresh) {
      setEntry(maskAmount(d));
      setFresh(false);
    } else {
      setEntry((e) => (e.replace(/[^\d,]/g, '').length < 14 ? maskAmount(e + d) : e));
    }
  };

  const pressComma = () => {
    setLast(null);
    if (fresh) {
      setEntry('0,');
      setFresh(false);
    } else {
      setEntry((e) => (e.includes(',') ? e : e === '' ? '0,' : e + ','));
    }
  };

  const pressOp = (o: Operator) => {
    setLast(null);
    const cur = parseAmount(entry);
    if (op != null && !fresh) {
      const r = operate(acc ?? 0, op, cur);
      if (!Number.isFinite(r)) {
        setEntry('Error');
        setOp(null);
        setAcc(null);
        setFresh(true);
        return;
      }
      setAcc(r);
      setEntry(formatAmountValue(mode === 'usd' ? r : r * rate));
    } else {
      setAcc(cur);
      setEntry(formatAmountValue(mode === 'usd' ? cur : cur * rate));
    }
    setOp(o);
    setFresh(true);
  };

  const pressEquals = () => {
    if (op != null) {
      const r = operate(acc ?? 0, op, parseAmount(entry));
      if (!Number.isFinite(r)) {
        setEntry('Error');
        setOp(null);
        setAcc(null);
        setFresh(true);
        return;
      }
      setAcc(r);
      setEntry(formatAmountValue(mode === 'usd' ? r : r * rate));
      setLast({ usd: r, bs: r * rate });
      setOp(null);
      setFresh(true);
    } else {
      const r = parseEntryUsd();
      setEntry(formatAmountValue(mode === 'usd' ? r : r * rate));
      setLast({ usd: r, bs: r * rate });
      setFresh(true);
    }
  };

  const pressClear = () => {
    setEntry('');
    setAcc(null);
    setOp(null);
    setFresh(true);
    setLast(null);
  };

  const pressBack = () => {
    if (fresh) {
      setEntry('');
      setFresh(false);
      return;
    }
    setEntry((e) => maskAmount(e.slice(0, -1)));
  };

  const toggleMode = () => {
    const curUsd = last ? last.usd : parseEntryUsd();
    const newMode: Currency = mode === 'usd' ? 'bs' : 'usd';
    setMode(newMode);
    setEntry(formatAmountValue(newMode === 'usd' ? curUsd : curUsd * rate));
    setLast(null);
  };

  const expr = op != null && acc != null ? `${formatAmountValue(mode === 'usd' ? acc : acc * rate)} ${OP_SYMBOL[op]}` : '';

  type KeyDef = { label: string; kind: 'num' | 'op' | 'fn'; value?: string; span?: string };
  const keys: KeyDef[] = [
    { label: 'AC', kind: 'fn', value: 'clear' },
    { label: '⌫', kind: 'fn', value: 'back' },
    { label: '÷', kind: 'op', value: '/' },
    { label: '×', kind: 'op', value: '*' },
    { label: '7', kind: 'num' },
    { label: '8', kind: 'num' },
    { label: '9', kind: 'num' },
    { label: '−', kind: 'op', value: '-' },
    { label: '4', kind: 'num' },
    { label: '5', kind: 'num' },
    { label: '6', kind: 'num' },
    { label: '+', kind: 'op', value: '+' },
    { label: '1', kind: 'num' },
    { label: '2', kind: 'num' },
    { label: '3', kind: 'num' },
    { label: '=', kind: 'fn', value: 'eq' },
    { label: '0', kind: 'num', span: 'col-span-2' },
    { label: ',', kind: 'fn', value: 'comma' },
  ];

  const handleKey = (k: KeyDef) => {
    if (k.kind === 'num') {
      pressDigit(k.label);
    } else if (k.kind === 'op') {
      pressOp(k.value as Operator);
    } else {
      switch (k.value) {
        case 'clear':
          pressClear();
          break;
        case 'back':
          pressBack();
          break;
        case 'eq':
          pressEquals();
          break;
        case 'comma':
          pressComma();
          break;
      }
    }
  };

  const keyClass = (k: KeyDef) => {
    if (k.kind === 'num') return darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-100' : 'bg-slate-100 hover:bg-slate-200 text-slate-900';
    if (k.kind === 'op') return 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 hover:brightness-110';
    if (k.value === 'clear') return darkMode ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-rose-100 text-rose-600 hover:bg-rose-200';
    if (k.value === 'eq') return 'bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 hover:brightness-110';
    return darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-100' : 'bg-slate-100 hover:bg-slate-200 text-slate-900';
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex overflow-hidden animate-in fade-in duration-200" onClick={onClose}>
      <div
        className={`w-full h-full flex flex-col overflow-hidden md:max-w-sm md:h-[min(80vh,720px)] md:rounded-3xl md:m-auto md:border shadow-2xl glass-panel ${
          darkMode ? 'bg-[#0b0e14] border-slate-800' : 'bg-white border-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Calculadora de Tasa</div>
            <div className="text-[10px] font-bold text-amber-500 mt-0.5">Tasa Bs. {rate.toFixed(2)} / $1</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMode}
              title={mode === 'usd' ? 'Moneda activa: USD — presiona para Bs.' : 'Moneda activa: Bs — presiona para USD'}
              className="min-w-[3.25rem] px-3 py-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 font-black text-base tracking-tight shadow-lg shadow-amber-500/30 hover:brightness-110 transition-all"
            >
              {mode === 'usd' ? '$' : 'Bs'}
            </button>
            <button
              onClick={onClose}
              className={`p-2.5 rounded-2xl border transition-all ${darkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}
              aria-label="Cerrar calculadora"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pantalla */}
        <div className="px-5">
          <div className={`rounded-2xl border p-4 text-right ${darkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
              <span>Resultado</span>
              <span className="text-amber-500">Miles · , decimales</span>
            </div>
            <div className="mt-1 text-[11px] font-bold text-slate-400 truncate h-4">{expr}</div>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-amber-400 truncate">
              {entry ? `${mode === 'usd' ? '$' : 'Bs.'} ${entry}` : mode === 'usd' ? '$ 0' : 'Bs. 0'}
            </div>
            <div className="text-xs font-black text-amber-200 mt-0.5">{entry && entry !== 'Error' ? oppositeLabel : '—'}</div>
          </div>
          {last && (
            <div className="flex items-center justify-between text-[10px] font-bold mt-2 px-1 text-slate-400">
              <span>Último resultado</span>
              <span className="text-amber-400">$ {formatAmountValue(last.usd)} · Bs. {formatAmountValue(last.bs)}</span>
            </div>
          )}
        </div>

        {/* Teclado */}
        <div className="flex-1 grid grid-cols-4 gap-3 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {keys.map((k, i) => (
            <button
              key={i}
              onClick={() => handleKey(k)}
              className={`${k.span ?? ''} rounded-2xl font-black text-lg tracking-tight shadow-lg transition-all duration-150 active:scale-95 ${keyClass(k)}`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------ FAB + CONTENEDOR ------------------------------ */
export function TasaCalculator() {
  const { darkMode } = useTheme();
  const { rate } = useStore();
  const [view, setView] = useState<View>('closed');

  return (
    <>
      <button
        onClick={() => setView('mini')}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-8 right-4 md:right-8 z-40 flex items-center rounded-full bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 text-white shadow-2xl shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
        aria-label="Calculadora de tasa"
      >
        <span className="relative w-14 h-14 rounded-full flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
          <Calculator className="w-6 h-6 relative" />
        </span>
        <span className={`hidden md:block pr-5 pl-1 text-xs font-black uppercase tracking-wider ${darkMode ? '' : 'text-slate-950'}`}>
          Tasa
        </span>
      </button>

      {view === 'mini' && <MiniModal rate={rate} darkMode={darkMode} onClose={() => setView('closed')} onFull={() => setView('full')} />}
      {view === 'full' && <FullCalculator rate={rate} darkMode={darkMode} onClose={() => setView('closed')} />}
    </>
  );
}