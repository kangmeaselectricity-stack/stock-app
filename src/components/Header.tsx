import React from 'react';
import { 
  Zap, 
  AlertTriangle, 
  PlusCircle, 
  Database,
  RotateCcw
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export type NavTab = 'dashboard' | 'pos' | 'inventory' | 'movements' | 'reports' | 'invoices';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenRestockModal: () => void;
  onOpenProductModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenRestockModal,
  onOpenProductModal,
}) => {
  const { lowStockProducts, resetToDemoData } = useInventory();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-2.5 text-left group transition-opacity"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/30">
                <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
              </div>
              <div>
                <div className="text-base font-bold text-white tracking-tight leading-tight group-hover:text-amber-400 transition-colors">
                  កងមាស អគ្គិសនី
                </div>
                <div className="text-[11px] text-slate-400 tracking-wider font-mono">
                  KANG MEAS ELECTRICITY
                </div>
              </div>
            </button>

            {/* Exchange rate indicator */}
            <div className="hidden lg:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-xs font-mono text-slate-300">
              <span className="text-amber-400 font-semibold">$1.00</span>
              <span className="text-slate-500">=</span>
              <span className="text-emerald-400 font-semibold">4,100 ៛</span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              ផ្ទាំងគ្រប់គ្រង
            </button>
            <button
              onClick={() => setActiveTab('pos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'pos'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              ចំណុចលក់ POS
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'inventory'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              ស្តុកទំនិញ
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'movements'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              ចេញ-ចូលស្តុក
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'reports'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              របាយការណ៍ប្រចាំថ្ងៃ
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'invoices'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              វិក្កយបត្រ
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2.5">
            {lowStockProducts.length > 0 && (
              <button
                onClick={() => setActiveTab('inventory')}
                title={`${lowStockProducts.length} មុខទំនិញជិតអស់ស្តុក`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-red-950/80 border border-red-800/80 text-red-300 hover:bg-red-900/60 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">ជិតអស់ស្តុក:</span>
                <span className="font-mono font-bold text-red-200">{lowStockProducts.length}</span>
              </button>
            )}

            <button
              onClick={onOpenRestockModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all rounded-lg shadow-sm whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>នាំចូលស្តុក</span>
            </button>

            <button
              onClick={onOpenProductModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors rounded-lg border border-slate-700 whitespace-nowrap"
            >
              <span>+ ទំនិញថ្មី</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('តើអ្នកចង់កំណត់ទិន្នន័យគំរូឡើងវិញ (Reset to Demo Data) មែនទេ?')) {
                  resetToDemoData();
                }
              }}
              title="កំណត់ទិន្នន័យគំរូឡើងវិញ"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-800/80 gap-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            ផ្ទាំងគ្រប់គ្រង
          </button>
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'pos' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            POS លក់
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'inventory' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            ស្តុកទំនិញ
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'movements' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            ចេញ-ចូល
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'reports' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            របាយការណ៍
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'invoices' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            វិក្កយបត្រ
          </button>
        </div>
      </div>
    </header>
  );
};
