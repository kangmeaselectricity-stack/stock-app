import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Edit2, 
  Trash2, 
  Download, 
  AlertTriangle,
  Package,
  Layers,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Product, Category } from '../types/inventory';
import { CATEGORIES } from '../data/initialData';
import { formatUsd, formatKhr, usdToKhr, getStockStatus } from '../utils/formatters';

interface InventoryViewProps {
  onOpenProductModal: (product?: Product | null) => void;
  onOpenRestockModal: (productId?: string) => void;
  onOpenStockOutModal: (productId?: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onOpenProductModal,
  onOpenRestockModal,
  onOpenStockOutModal,
}) => {
  const { products, deleteProduct } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'out' | 'in'>('all');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.nameKh.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.supplier.toLowerCase().includes(q);

      let matchStatus = true;
      if (statusFilter === 'low') {
        matchStatus = p.stockQty > 0 && p.stockQty <= p.minStockQty;
      } else if (statusFilter === 'out') {
        matchStatus = p.stockQty <= 0;
      } else if (statusFilter === 'in') {
        matchStatus = p.stockQty > p.minStockQty;
      }

      return matchCat && matchSearch && matchStatus;
    });
  }, [products, selectedCategory, searchQuery, statusFilter]);

  // Export inventory sheet to CSV
  const handleExportCsv = () => {
    const headers = [
      'កូដ SKU',
      'បាកូដ',
      'ឈ្មោះទំនិញខ្មែរ',
      'ឈ្មោះអង់គ្លេស',
      'ប្រភេទ',
      'ខ្នាត',
      'ថ្លៃដើម ($)',
      'តម្លៃលក់ ($)',
      'ស្តុកបច្ចុប្បន្ន',
      'កម្រិតព្រមាន',
      'ទីតាំង',
      'អ្នកផ្គត់ផ្គង់',
    ];

    const rows = filteredProducts.map(p => [
      `"${p.sku}"`,
      `"${p.barcode}"`,
      `"${p.nameKh.replace(/"/g, '""')}"`,
      `"${p.nameEn.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.unit}"`,
      p.costPriceUsd,
      p.salePriceUsd,
      p.stockQty,
      p.minStockQty,
      `"${p.location}"`,
      `"${p.supplier.replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kangmeas-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`តើអ្នកពិតជាចង់លុបទំនិញ "${name}" ចេញពីប្រព័ន្ធមែនទេ?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            បញ្ជីស្តុកសំភារៈអគ្គិសនី (Inventory Catalog)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            គ្រប់គ្រងបរិមាណស្តុក ថ្លៃដើម តម្លៃលក់ និងកម្រិតព្រមាន
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>ទាញយក CSV</span>
          </button>
          <button
            onClick={() => onOpenProductModal(null)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ បន្ថែមទំនិញថ្មី</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកតាមឈ្មោះខ្មែរ/អង់គ្លេស, SKU, បាកូដ, ទីតាំង, អ្នកផ្គត់ផ្គង់..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Stock Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === 'all'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              ទាំងអស់ ({products.length})
            </button>
            <button
              onClick={() => setStatusFilter('low')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === 'low'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-amber-400 hover:bg-slate-800'
              }`}
            >
              ជិតអស់ស្តុក ({products.filter(p => p.stockQty > 0 && p.stockQty <= p.minStockQty).length})
            </button>
            <button
              onClick={() => setStatusFilter('out')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === 'out'
                  ? 'bg-red-500 text-white font-bold'
                  : 'bg-slate-950 text-red-400 hover:bg-slate-800'
              }`}
            >
              អស់ស្តុក ({products.filter(p => p.stockQty <= 0).length})
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-800/80 pt-2.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.nameKh}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-3 px-3.5">កូដ SKU / បាកូដ</th>
                <th className="py-3 px-3.5">ឈ្មោះទំនិញអគ្គិសនី</th>
                <th className="py-3 px-3.5">ទីតាំង / អ្នកផ្គត់ផ្គង់</th>
                <th className="py-3 px-3.5 text-right">ថ្លៃដើម ($)</th>
                <th className="py-3 px-3.5 text-right">តម្លៃលក់ ($)</th>
                <th className="py-3 px-3.5 text-center">ស្តុកជាក់ស្តែង</th>
                <th className="py-3 px-3.5 text-center">ស្ថានភាព</th>
                <th className="py-3 px-3.5 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-mono">
              {filteredProducts.map(product => {
                const status = getStockStatus(product.stockQty, product.minStockQty);
                return (
                  <tr key={product.id} className="hover:bg-slate-850/60 transition-colors">
                    {/* SKU & Barcode */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-bold text-amber-400">{product.sku}</div>
                      <div className="text-[10px] text-slate-500">{product.barcode}</div>
                    </td>

                    {/* Product Name */}
                    <td className="py-3 px-3.5 font-sans min-w-[200px]">
                      <div className="font-medium text-slate-100">{product.nameKh}</div>
                      <div className="text-[11px] text-slate-500">{product.nameEn}</div>
                    </td>

                    {/* Location & Supplier */}
                    <td className="py-3 px-3.5 font-sans text-slate-400">
                      <div>{product.location}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                        {product.supplier}
                      </div>
                    </td>

                    {/* Cost Price */}
                    <td className="py-3 px-3.5 text-right tabular-nums text-slate-300">
                      <div>{formatUsd(product.costPriceUsd)}</div>
                      <div className="text-[10px] text-slate-500">
                        {formatKhr(usdToKhr(product.costPriceUsd))}
                      </div>
                    </td>

                    {/* Sale Price */}
                    <td className="py-3 px-3.5 text-right tabular-nums font-bold text-emerald-400">
                      <div>{formatUsd(product.salePriceUsd)}</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        {formatKhr(usdToKhr(product.salePriceUsd))}
                      </div>
                    </td>

                    {/* Stock Quantity */}
                    <td className="py-3 px-3.5 text-center tabular-nums font-bold">
                      <div className="text-sm text-slate-100">
                        {product.stockQty} <span className="text-[11px] font-sans font-normal text-slate-400">{product.unit}</span>
                      </div>
                      <div className="text-[10px] font-sans font-normal text-slate-500">
                        កម្រិតព្រមាន: {product.minStockQty}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3.5 text-center font-sans">
                      {status.variant === 'danger' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">
                          {status.labelKh}
                        </span>
                      )}
                      {status.variant === 'warning' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                          {status.labelKh}
                        </span>
                      )}
                      {status.variant === 'success' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {status.labelKh}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-right font-sans whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenRestockModal(product.id)}
                          title="នាំចូលស្តុកបន្ថែម"
                          className="p-1.5 rounded-md bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 hover:bg-emerald-900 transition-colors"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenStockOutModal(product.id)}
                          title="កាត់ស្តុកចេញ / ខូចខាត"
                          className="p-1.5 rounded-md bg-red-950/80 border border-red-800/80 text-red-400 hover:bg-red-900 transition-colors"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenProductModal(product)}
                          title="កែសម្រួល"
                          className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.nameKh)}
                          title="លុបទំនិញ"
                          className="p-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            មិនមានទិន្នន័យទំនិញក្នុងស្តុកឡើយ
          </div>
        )}
      </div>
    </div>
  );
};
