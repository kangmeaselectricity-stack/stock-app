import React, { useState, useEffect } from 'react';
import { X, PackagePlus, Edit } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Product, Category } from '../types/inventory';
import { CATEGORIES } from '../data/initialData';
import { formatKhr, usdToKhr } from '../utils/formatters';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { addProduct, updateProduct } = useInventory();

  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [nameKh, setNameKh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState<Exclude<Category, 'all'>>('cables');
  const [unit, setUnit] = useState('គ្រាប់');
  const [costPriceUsd, setCostPriceUsd] = useState<number>(0);
  const [salePriceUsd, setSalePriceUsd] = useState<number>(0);
  const [stockQty, setStockQty] = useState<number>(0);
  const [minStockQty, setMinStockQty] = useState<number>(10);
  const [location, setLocation] = useState('ធ្នើ A-01');
  const [supplier, setSupplier] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setSku(productToEdit.sku);
      setBarcode(productToEdit.barcode);
      setNameKh(productToEdit.nameKh);
      setNameEn(productToEdit.nameEn);
      setCategory(productToEdit.category);
      setUnit(productToEdit.unit);
      setCostPriceUsd(productToEdit.costPriceUsd);
      setSalePriceUsd(productToEdit.salePriceUsd);
      setStockQty(productToEdit.stockQty);
      setMinStockQty(productToEdit.minStockQty);
      setLocation(productToEdit.location);
      setSupplier(productToEdit.supplier);
      setDescription(productToEdit.description || '');
    } else {
      // Defaults for new product
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      setSku(`ELC-${randomCode}`);
      setBarcode(`885${Date.now().toString().slice(-9)}`);
      setNameKh('');
      setNameEn('');
      setCategory('cables');
      setUnit('គ្រាប់');
      setCostPriceUsd(0);
      setSalePriceUsd(0);
      setStockQty(20);
      setMinStockQty(5);
      setLocation('ធ្នើ A-01');
      setSupplier('ក្រុមហ៊ុនចែកចាយសំភារៈអគ្គិសនី');
      setDescription('');
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameKh.trim() || !sku.trim()) {
      alert('សូមបញ្ចូលឈ្មោះទំនិញជាភាសាខ្មែរ និងកូដ SKU');
      return;
    }

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        sku: sku.trim(),
        barcode: barcode.trim(),
        nameKh: nameKh.trim(),
        nameEn: nameEn.trim(),
        category,
        unit: unit.trim(),
        costPriceUsd,
        salePriceUsd,
        stockQty,
        minStockQty,
        location: location.trim(),
        supplier: supplier.trim(),
        description: description.trim() || undefined,
      });
    } else {
      addProduct({
        sku: sku.trim(),
        barcode: barcode.trim(),
        nameKh: nameKh.trim(),
        nameEn: nameEn.trim(),
        category,
        unit: unit.trim(),
        costPriceUsd,
        salePriceUsd,
        stockQty,
        minStockQty,
        location: location.trim(),
        supplier: supplier.trim(),
        description: description.trim() || undefined,
      });
    }

    onClose();
  };

  const categoriesOptions = CATEGORIES.filter(c => c.id !== 'all') as { id: Exclude<Category, 'all'>; nameKh: string }[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400">
            {productToEdit ? <Edit className="w-5 h-5" /> : <PackagePlus className="w-5 h-5" />}
            <h2 className="text-base font-bold text-white">
              {productToEdit ? 'កែសម្រួលព័ត៌មានទំនិញអគ្គិសនី' : 'បន្ថែមទំនិញអគ្គិសនីថ្មីក្នុងស្តុក'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Row 1: SKU & Barcode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                កូដសម្គាល់ (SKU) <span className="text-red-400">*</span>:
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="ឧ. CBL-CDV-25"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                លេខកូដបារកូដ (Barcode):
              </label>
              <input
                type="text"
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                placeholder="ឧ. 8934567100012"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* Row 2: Khmer Name & English Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                ឈ្មោះទំនិញជាភាសាខ្មែរ <span className="text-red-400">*</span>:
              </label>
              <input
                type="text"
                required
                value={nameKh}
                onChange={e => setNameKh(e.target.value)}
                placeholder="ឧ. ខ្សែភ្លើង Cadivi 2.5mm² (ដុំ 100m)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:border-amber-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                ឈ្មោះជាភាសាអង់គ្លេស:
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                placeholder="ឧ. Cadivi Cable 2.5mm² (100m Roll)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* Row 3: Category & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                ប្រភេទសំភារៈ (Category):
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:border-amber-500"
              >
                {categoriesOptions.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nameKh}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                ខ្នាតឯកតា (Unit):
              </label>
              <input
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="ដុំ, ម៉ែត្រ, គ្រាប់, ឈុត, ដើម..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* Row 4: Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                ថ្លៃដើម ($ USD):
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPriceUsd}
                onChange={e => setCostPriceUsd(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-hidden focus:border-amber-500"
              />
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                ≈ {formatKhr(usdToKhr(costPriceUsd))}
              </div>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                តម្លៃលក់ចេញ ($ USD):
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={salePriceUsd}
                onChange={e => setSalePriceUsd(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-amber-400 font-mono text-sm font-bold focus:outline-hidden focus:border-amber-500"
              />
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                ≈ {formatKhr(usdToKhr(salePriceUsd))} (ចំណេញ: ${(salePriceUsd - costPriceUsd).toFixed(2)})
              </div>
            </div>
          </div>

          {/* Row 5: Stock Quantity & Min Stock Threshold */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                ចំនួនស្តុកបច្ចុប្បន្ន:
              </label>
              <input
                type="number"
                min="0"
                value={stockQty}
                onChange={e => setStockQty(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                កម្រិតព្រមានជិតអស់ស្តុក (Min Alert):
              </label>
              <input
                type="number"
                min="1"
                value={minStockQty}
                onChange={e => setMinStockQty(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* Row 6: Location & Supplier */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                ទីតាំងដាក់ទំនិញក្នុងឃ្លាំង/ធ្នើ:
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="ឧ. ធ្នើ A-01, ឃ្លាំង C"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                ក្រុមហ៊ុនផ្គត់ផ្គង់ (Supplier):
              </label>
              <input
                type="text"
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                placeholder="ឧ. Cadivi Cambodia"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              ព័ត៌មានលម្អិតបច្ចេកទេស (Specifications):
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="កម្លាំងអគ្គិសនី, ទំហំខ្សែ, ប្រភេទទឹកភ្លៀង IP67, ម៉ាកយីហោ..."
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
              {productToEdit ? 'រក្សាទុកការកែប្រែ' : 'បន្ថែមក្នុងស្តុក'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
