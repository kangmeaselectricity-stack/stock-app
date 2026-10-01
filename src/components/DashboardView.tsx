import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  ShoppingCart, 
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { formatUsd, formatKhr, formatDateTimeKh } from '../utils/formatters';
import { NavTab } from './Header';

interface DashboardViewProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenRestockModal: (productId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenRestockModal,
}) => {
  const { products, movements, transactions, getDailyReport, lowStockProducts } = useInventory();
  const todayReport = getDailyReport();

  // Compute total inventory inventory value
  const totalInventoryAssetValue = products.reduce((acc, p) => acc + p.stockQty * p.costPriceUsd, 0);
  const totalStockItemsCount = products.reduce((acc, p) => acc + p.stockQty, 0);

  const recentTransactions = transactions.slice(0, 5);
  const recentMovements = movements.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Welcome Banner / Overview Kicker */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>ថ្ងៃនេះ៖ {todayReport.date}</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400">ប្រព័ន្ធតាមដានស្តុកស្វ័យប្រវត្តិកំពុងដំណើរការ</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              ផ្ទាំងគ្រប់គ្រងស្តុក និងការលក់សំភារៈអគ្គិសនី
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              ហាង កងមាស អគ្គិសនី · តាមដានចំណូល ទំនិញចេញ-ចូល និងស្តុកទំនិញក្នុងឃ្លាំង
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('pos')}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-sm rounded-lg shadow-md shadow-amber-500/10 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>បើកបញ្ជរលក់ POS</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-colors"
            >
              <span>មើលរបាយការណ៍សង្ខេប</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Daily Sales */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ចំណូលលក់ថ្ងៃនេះ</span>
            <span className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/50">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-white">
              {formatUsd(todayReport.totalSalesUsd)}
            </div>
            <div className="text-xs font-mono tabular-nums text-emerald-400 mt-0.5">
              ≈ {formatKhr(todayReport.totalSalesKhr)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>វិក្កយបត្រ៖ <strong className="text-slate-200 font-mono">{todayReport.totalTransactionsCount}</strong></span>
            <span>លក់បាន៖ <strong className="text-slate-200 font-mono">{todayReport.totalItemsSold}</strong> មុខ</span>
          </div>
        </div>

        {/* Estimated Gross Profit */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ចំណេញដុលប៉ាន់ស្មាន</span>
            <span className="p-1.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-800/50">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-white">
              {formatUsd(todayReport.totalProfitUsd)}
            </div>
            <div className="text-xs font-mono tabular-nums text-blue-400 mt-0.5">
              អត្រាចំណេញ {todayReport.profitMarginPercent.toFixed(1)}%
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>ថ្លៃដើមទំនិញ៖</span>
            <span className="font-mono text-slate-300">{formatUsd(todayReport.totalCostUsd)}</span>
          </div>
        </div>

        {/* Stock Out Today */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ទំនិញចេញថ្ងៃនេះ (ស្វ័យប្រវត្តិ)</span>
            <span className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800/50">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-white">
              {todayReport.totalStockOutQty} <span className="text-sm font-normal text-slate-400">ឯកតា</span>
            </div>
            <div className="text-xs font-mono tabular-nums text-amber-400 mt-0.5">
              ថ្លៃដើម {formatUsd(todayReport.totalStockOutValueUsd)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>កាត់ស្តុកស្វ័យប្រវត្តិតាម POS</span>
            <span className="text-emerald-400 text-[11px]">បច្ចុប្បន្នភាព</span>
          </div>
        </div>

        {/* Stock In Today */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ទំនិញនាំចូលថ្ងៃនេះ</span>
            <span className="p-1.5 rounded-lg bg-purple-950 text-purple-400 border border-purple-800/50">
              <ArrowDownLeft className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-white">
              {todayReport.totalStockInQty} <span className="text-sm font-normal text-slate-400">ឯកតា</span>
            </div>
            <div className="text-xs font-mono tabular-nums text-purple-400 mt-0.5">
              ទឹកប្រាក់ {formatUsd(todayReport.totalStockInValueUsd)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>បំពេញស្តុកពីអ្នកផ្គត់ផ្គង់</span>
            <button 
              onClick={() => onOpenRestockModal()}
              className="text-amber-400 hover:text-amber-300 font-medium text-[11px]"
            >
              + នាំចូលថ្មី
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Low stock alerts & Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Low Stock Alerts & Warehouse Assets (1 col) */}
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">ទំនិញជិតអស់ស្តុក ({lowStockProducts.length})</h2>
              </div>
              <button
                onClick={() => setActiveTab('inventory')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-0.5 font-medium"
              >
                <span>មើលទាំងអស់</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mb-2" />
                <span>ស្តុកទំនិញទាំងអស់ស្ថិតក្នុងកម្រិតសុវត្ថិភាព</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockProducts.slice(0, 4).map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-200 truncate">{item.nameKh}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {item.sku} · ទីតាំង: {item.location}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-red-400 tabular-nums">
                        សល់ {item.stockQty} {item.unit}
                      </div>
                      <button
                        onClick={() => onOpenRestockModal(item.id)}
                        className="mt-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 underline"
                      >
                        បញ្ជាទិញបន្ថែម
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Warehouse Asset Value */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-white">សរុបតម្លៃស្តុកក្នុងឃ្លាំង</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">តម្លៃដើមស្តុកសរុប</span>
                <span className="font-mono font-bold text-white tabular-nums text-sm">
                  {formatUsd(totalInventoryAssetValue)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">ចំនួនមុខទំនិញសរុប</span>
                <span className="font-mono font-bold text-slate-200 tabular-nums">
                  {products.length} មុខ
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">បរិមាណឯកតាក្នុងស្តុក</span>
                <span className="font-mono font-bold text-slate-200 tabular-nums">
                  {totalStockItemsCount.toLocaleString()} ឯកតា
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Automated Stock Movement Ledger & Recent Sales (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Automated Movements Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-bold text-white">ចលនាស្តុកចេញ-ចូលស្វ័យប្រវត្តិចុងក្រោយ</h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  រាល់ពេលលក់តាម POS ឬនាំចូល ប្រព័ន្ធនឹងកត់ត្រានិងកែប្រែចំនួនស្តុកភ្លាមៗ
                </p>
              </div>
              <button
                onClick={() => setActiveTab('movements')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-0.5 font-medium"
              >
                <span>មើលកំណត់ហេតុទាំងអស់</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium">
                    <th className="py-2 px-3">កាលបរិច្ឆេទ</th>
                    <th className="py-2 px-3">ទំនិញ</th>
                    <th className="py-2 px-3">ប្រភេទចលនា</th>
                    <th className="py-2 px-3 text-right">ប្រែប្រួល</th>
                    <th className="py-2 px-3 text-right">ស្តុកចុងក្រោយ</th>
                    <th className="py-2 px-3">យោង</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {recentMovements.map(m => {
                    const isAddition = m.qtyChange > 0;
                    return (
                      <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 font-sans whitespace-nowrap">
                          {formatDateTimeKh(m.timestamp)}
                        </td>
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-200 max-w-[200px] truncate">
                          {m.productName}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          {m.type === 'out_sale' && (
                            <span className="text-amber-400 font-medium">លក់ចេញ (POS)</span>
                          )}
                          {m.type === 'in_purchase' && (
                            <span className="text-emerald-400 font-medium">នាំចូលស្តុក</span>
                          )}
                          {m.type === 'out_damaged' && (
                            <span className="text-red-400 font-medium">ខូចខាត</span>
                          )}
                          {m.type === 'adjust' && (
                            <span className="text-blue-400 font-medium">កែសម្រួល</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-bold">
                          <span className={isAddition ? 'text-emerald-400' : 'text-amber-400'}>
                            {isAddition ? `+${m.qtyChange}` : m.qtyChange}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-300">
                          {m.newQty}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-[120px]">
                          {m.referenceId || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Sales Invoices */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">វិក្កយបត្រលក់ចុងក្រោយ</h2>
                <p className="text-xs text-slate-400 mt-0.5">ការបញ្ជាទិញនិងគិតលុយថ្មីៗ</p>
              </div>
              <button
                onClick={() => setActiveTab('invoices')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-0.5 font-medium"
              >
                <span>មើលវិក្កយបត្រទាំងអស់</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium">
                    <th className="py-2 px-3">លេខវិក្កយបត្រ</th>
                    <th className="py-2 px-3">អតិថិជន</th>
                    <th className="py-2 px-3">ចំនួនមុខ</th>
                    <th className="py-2 px-3">ទូទាត់តាម</th>
                    <th className="py-2 px-3 text-right">សរុប ($)</th>
                    <th className="py-2 px-3 text-right">សរុប (៛)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {recentTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-amber-400">
                        {t.id}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-200">
                        {t.customerName}
                      </td>
                      <td className="py-2.5 px-3 tabular-nums text-slate-300">
                        {t.totalQty} មុខ
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {t.paymentMethod === 'khqr' && (
                          <span className="text-emerald-400">KHQR / ABA</span>
                        )}
                        {t.paymentMethod === 'cash' && (
                          <span className="text-blue-400">សាច់ប្រាក់</span>
                        )}
                        {t.paymentMethod === 'credit' && (
                          <span className="text-amber-400">ជំពាក់</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-white">
                        {formatUsd(t.totalUsd)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-400">
                        {formatKhr(t.totalKhr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
