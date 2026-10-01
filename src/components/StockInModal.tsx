import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, Package, DollarSign, Building } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { formatUsd } from '../utils/formatters';

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProductId?: string;
}

export const StockInModal: React.FC<StockInModalProps> = ({
  isOpen,
  onClose,
  preselectedProductId,
}) => {
  const { products, recordStockIn } = useInventory();

  const [productId, setProductId] = useState<string>(preselectedProductId || (products[0]?.id ?? ''));
  const [qty, setQty] = useState<number>(10);
  const [unitCostUsd, setUnitCostUsd] = useState<number>(0);
  const [supplier, setSupplier] = useState<string>('');
  const [referenceId, setReferenceId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const selectedProduct = products.find(p => p.id === productId);

  useEffect(() => {
    if (preselectedProductId) {
      setProductId(preselectedProductId);
    } else if (products.length > 0 && !productId) {
      setProductId(products[0].id);
    }
  }, [preselectedProductId, products]);

  useEffect(() => {
    if (selectedProduct) {
      setUnitCostUsd(selectedProduct.costPriceUsd);
      setSupplier(selectedProduct.supplier);
    }
  }, [selectedProduct]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || qty <= 0) {
      alert('សូមបញ្ចូលបរិមាណនាំចូលត្រឹមត្រូវ');
      return;
    }

    recordStockIn({
      productId,
      qty,
      unitCostUsd: unitCostUsd > 0 ? unitCostUsd : (selectedProduct?.costPriceUsd || 0),
      supplier: supplier.trim() || undefined,
      referenceId: referenceId.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const totalCost = (qty || 0) * (unitCostUsd || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400">
            <ArrowDownLeft className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">នាំចូលស្តុកទំនិញបន្ថែម (Stock In)</h2>
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
                <span className="text-slate-500">ស្តុកក្រោយនាំចូល: </span>
                <strong className="text-emerald-400 font-mono tabular-nums">
                  {selectedProduct.stockQty + (Number(qty) || 0)} {selectedProduct.unit}
                </strong>
              </div>
            </div>
          )}

          {/* Quantity & Unit Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                បរិមាណនាំចូល ({selectedProduct?.unit || 'ឯកតា'}):
              </label>
              <input
                type="number"
                min="1"
                required
                value={qty}
                onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                ថ្លៃដើមនាំចូល ($ / ឯកតា):
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={unitCostUsd}
                onChange={e => setUnitCostUsd(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* Supplier & Reference */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                ក្រុមហ៊ុនផ្គត់ផ្គង់ (Supplier):
              </label>
              <input
                type="text"
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                placeholder="ឈ្មោះក្រុមហ៊ុន/អ្នកលក់ដុំ"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                លេខវិក្កយបត្រយោង / PO:
              </label>
              <input
                type="text"
                value={referenceId}
                onChange={e => setReferenceId(e.target.value)}
                placeholder="ឧ. PO-8821"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* Total Value calculation */}
          <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg flex items-center justify-between">
            <span className="text-slate-300">ទឹកប្រាក់នាំចូលសរុប:</span>
            <span className="text-base font-bold font-mono text-emerald-400 tabular-nums">
              {formatUsd(totalCost)}
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              កំណត់សម្គាល់ (ស្រេចចិត្ត):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="ព័ត៌មានបន្ថែមអំពីការនាំចូលស្តុក..."
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
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors shadow-sm"
            >
              កត់ត្រានាំចូលស្តុក
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
