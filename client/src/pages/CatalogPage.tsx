import { useMemo, useState } from 'react';
import type { Product, VehicleType } from '@shared/types';
import { Bike, Car, Filter, Flame, Search } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailsModal } from '../components/modals/ProductDetailsModal';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';

type SortKey = 'featured' | 'price_asc' | 'price_desc' | 'name';

const categories = [
  { value: 'all', label: 'Todas las Categorías' },
  { value: 'motor', label: 'Motor' },
  { value: 'frenos', label: 'Frenos' },
  { value: 'suspensión', label: 'Suspensión' },
  { value: 'transmisión', label: 'Transmisión' },
  { value: 'eléctrico', label: 'Eléctrico' },
];

export function CatalogPage() {
  const { darkMode } = useTheme();
  const { products } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState<VehicleType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortKey>('featured');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesVehicle = vehicleFilter === 'all' || p.type === vehicleFilter;
        const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
        return matchesSearch && matchesVehicle && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return b.rating - a.rating;
      });
  }, [products, searchQuery, vehicleFilter, categoryFilter, sortBy]);

  const selectClass = (dark: boolean) =>
    `px-4 py-3 rounded-2xl border text-xs font-black uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500 ${
      dark ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
    }`;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* HERO */}
      <div className="relative rounded-3xl overflow-hidden mb-12 bg-gradient-to-br from-slate-950 via-[#121620] to-amber-950 p-6 sm:p-12 lg:p-16 text-white shadow-2xl border border-slate-800/80 flex flex-col lg:flex-row items-center justify-between gap-10 w-full glass-panel">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest shadow-inner">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" /> Doble Etiquetado Dinámico (USD / VES)
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Componentes de Competición con{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Tasa BCV en Tiempo Real
            </span>
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-slate-300">
            Adquiere repuestos de alta gama para carros y motos con total transparencia cambiaria, autenticación
            biométrica passkey para pedidos VIP y rastreo satelital.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setVehicleFilter('car')}
              className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all duration-200 shadow-lg glass-panel ${
                vehicleFilter === 'car'
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/40 ring-2 ring-amber-300'
                  : 'bg-slate-900/80 text-slate-200 border border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Car className="w-4 h-4" /> Autopartes Carros
            </button>
            <button
              onClick={() => setVehicleFilter('moto')}
              className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all duration-200 shadow-lg glass-panel ${
                vehicleFilter === 'moto'
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/40 ring-2 ring-amber-300'
                  : 'bg-slate-900/80 text-slate-200 border border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Bike className="w-4 h-4" /> Repuestos Motos
            </button>
          </div>
        </div>

        <div className="relative z-10 hidden lg:block w-80 h-56 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 group">
          <img
            src="https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800"
            alt="Garaje de competición"
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-black">
            <span className="text-amber-400">⚡ Biometría VIP</span>
            <span className="text-white bg-red-600/80 px-2.5 py-1 rounded-lg">BCV Verificado</span>
          </div>
        </div>
      </div>

      {/* BUSCADOR Y FILTROS */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border mb-10 flex flex-col xl:flex-row gap-5 items-center justify-between shadow-xl backdrop-blur-xl w-full glass-panel ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="relative w-full xl:w-96">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-amber-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, pieza o SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-2xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
              darkMode
                ? 'bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <Filter className="hidden md:block w-4 h-4 text-amber-500" />
          <select value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value as VehicleType | 'all')} className={selectClass(darkMode)}>
            <option value="all">Todos los Vehículos</option>
            <option value="car">Carros</option>
            <option value="moto">Motos</option>
          </select>

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={selectClass(darkMode)}>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className={selectClass(darkMode)}>
            <option value="featured">Más Destacados</option>
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
            <option value="name">Nombre A-Z</option>
          </select>
        </div>
      </div>

      {/* GRID DE PRODUCTOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} onInspect={setSelectedProduct} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="p-12 rounded-3xl border text-center text-sm font-bold text-slate-400 glass-panel">
          No se encontraron repuestos con esos filtros.
        </div>
      )}

      <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
