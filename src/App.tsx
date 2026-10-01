import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Header, NavTab } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PosView } from './components/PosView';
import { InventoryView } from './components/InventoryView';
import { StockMovementView } from './components/StockMovementView';
import { DailyReportView } from './components/DailyReportView';
import { SalesInvoiceView } from './components/SalesInvoiceView';
import { ProductFormModal } from './components/ProductFormModal';
import { StockInModal } from './components/StockInModal';
import { StockOutModal } from './components/StockOutModal';
import { Product } from './types/inventory';
import { Zap, Download, Upload, ShieldCheck, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockProductId, setRestockProductId] = useState<string | undefined>(undefined);

  const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);
  const [stockOutProductId, setStockOutProductId] = useState<string | undefined>(undefined);

  const { exportDatabaseJson, importDatabaseJson } = useInventory();

  const handleOpenProductModal = (product?: Product | null) => {
    setProductToEdit(product || null);
    setIsProductModalOpen(true);
  };

  const handleOpenRestockModal = (productId?: string) => {
    setRestockProductId(productId);
    setIsRestockModalOpen(true);
  };

  const handleOpenStockOutModal = (productId?: string) => {
    setStockOutProductId(productId);
    setIsStockOutModalOpen(true);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDatabaseJson(content);
        if (success) {
          alert('ទិន្នន័យត្រូវបានទាញបញ្ចូល (Restore) ដោយជោគជ័យ!');
        } else {
          alert('ឯកសារ JSON មិនត្រឹមត្រូវ សូមពិនិត្យឡើងវិញ');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 3-Zone Navigation Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRestockModal={() => handleOpenRestockModal()}
        onOpenProductModal={() => handleOpenProductModal()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            setActiveTab={setActiveTab}
            onOpenRestockModal={handleOpenRestockModal}
          />
        )}

        {activeTab === 'pos' && (
          <PosView
            onOpenRestockModal={handleOpenRestockModal}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            onOpenProductModal={handleOpenProductModal}
            onOpenRestockModal={handleOpenRestockModal}
            onOpenStockOutModal={handleOpenStockOutModal}
          />
        )}

        {activeTab === 'movements' && (
          <StockMovementView
            onOpenRestockModal={handleOpenRestockModal}
            onOpenStockOutModal={handleOpenStockOutModal}
          />
        )}

        {activeTab === 'reports' && (
          <DailyReportView />
        )}

        {activeTab === 'invoices' && (
          <SalesInvoiceView />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-6 text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
            </div>
            <span className="font-semibold text-slate-200">ហាង កងមាស អគ្គិសនី</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">ប្រព័ន្ធគ្រប់គ្រងស្តុក និងតាមដានការលក់ស្វ័យប្រវត្តិ</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportDatabaseJson}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="ទាញយកទិន្នន័យបម្រុងទុក (Backup JSON)"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>បម្រុងទុកទិន្នន័យ (Backup)</span>
            </button>

            <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>បញ្ចូលទិន្នន័យ (Restore)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </footer>

      {/* Product Form Modal (Add / Edit) */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
      />

      {/* Stock In Modal (Restock) */}
      <StockInModal
        isOpen={isRestockModalOpen}
        onClose={() => {
          setIsRestockModalOpen(false);
          setRestockProductId(undefined);
        }}
        preselectedProductId={restockProductId}
      />

      {/* Stock Out Modal (Damaged / Deduct) */}
      <StockOutModal
        isOpen={isStockOutModalOpen}
        onClose={() => {
          setIsStockOutModalOpen(false);
          setStockOutProductId(undefined);
        }}
        preselectedProductId={stockOutProductId}
      />
    </div>
  );
};

export default function App() {
  return (
    <InventoryProvider>
      <AppContent />
    </InventoryProvider>
  );
}
