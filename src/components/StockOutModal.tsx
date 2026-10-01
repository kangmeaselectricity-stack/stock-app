import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, AlertOctagon } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

interface StockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProductId?: string;
}

export const StockOutModal: React.FC<StockOutModalProps> = ({
  isOpen,
  onClose,
  preselectedProductId,
}) => {
  const { products, recordStockOut } = useInventory();

  const [productId, setProductId] = useState<string>(preselectedProductId || (products[0]?.id ?? ''));
  const [qty, setQty] = useState<number>(1);
  const [type, setType] = useState<'out_damaged' | 'out_internal' | 'adjust'>('out_damaged');
  const [notes, setNotes] = useState<string>('');

  const selectedProduct = products.find(p => p.id === productId);

  useEffect(() => {
    if (preselectedProductId) {
      setProductId(preselectedProductId);
    } else if (products.length > 0 && !productId) {
      setProductId(products[0].id);
    }
  }, [preselectedProductId, products]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || qty <= 0) {
      alert('សូមបញ្ចូលបរិមាណត្រឹមត្រូវ');
      return;
    }

    if (selectedProduct && qty > selectedProduct.stockQty) {
      alert(`ចំនួនដកចេញមិនអាចធំជាងស្តុកបច្ចុប្បន្ន (${selectedProduct.stockQty}) ឡើយ!`);
      return;
    }

    recordStockOut({
      productId,
      qty,
      type,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400">
            <ArrowUpRight className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">កាត់ស្តុកចេញ / កែសម្រួល (Stock Out)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Select Product */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              ជ្រើសរើសទំនិញអគ្គិសនី:
            </label>
            <select
              value={productId}
              onChange={e => setProductId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:border-amber-500"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nameKh} ({p.sku}) - នៅសល់: {p.stockQty} {p.unit}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between text-[11px]">
              <div>
                <span className="text-slate-500">ស្តុកបច្ចុប្បន្ន: </span>
                <strong className="text-slate-200 font-mono tabular-nums">
                  {selectedProduct.stockQty} {selectedProduct.unit}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">ស្តុកក្រោយកាត់ចេញ: </span>
                <strong className="text-amber-400 font-mono tabular-nums">
                  {Math.max(0, selectedProduct.stockQty - (Number(qty) || 0))} {selectedProduct.unit}
                </strong>
              </div>
            </div>
          )}

          {/* Reason / Type */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              មូលហេតុកាត់ស្តុកចេញ:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('out_damaged')}
                className={`p-2.5 rounded-lg border text-center transition-colors ${
                  type === 'out_damaged'
                    ? 'bg-red-500/10 border-red-500 text-red-400 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                ទំនិញខូចខាត
              </button>
              <button
                type="button"
                onClick={() => setType('out_internal')}
                className={`p-2.5 rounded-lg border text-center transition-colors ${
                  type === 'out_internal'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-400 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                ប្រើប្រាស់ផ្ទៃក្នុង
              </button>
              <button
                type="button"
                onClick={() => setType('adjust')}
                className={`p-2.5 rounded-lg border text-center transition-colors ${
                  type === 'adjust'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                កែតម្រូវសវនកម្ម
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              បរិមាណត្រូវកាត់ចេញ ({selectedProduct?.unit || 'ឯកតា'}):
            </label>
            <input
              type="number"
              min="1"
              max={selectedProduct?.stockQty || 9999}
              required
              value={qty}
              onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              កំណត់សម្គាល់លម្អិត:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="មូលហេតុលម្អិត (ឧ. បាក់បែកពេលដឹកជញ្ជូន ឬយកទៅតេស្តការដ្ឋាន...)"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors shadow-sm"
            >
              អនុម័តកាត់ស្តុក
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
