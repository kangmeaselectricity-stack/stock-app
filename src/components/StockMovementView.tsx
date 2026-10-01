import React, { useState, useMemo } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  PlusCircle, 
  MinusCircle,
  Calendar,
  Layers,
  Clock
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { StockMovementType } from '../types/inventory';
import { formatDateTimeKh, formatUsd, getTodayDateString } from '../utils/formatters';

interface StockMovementViewProps {
  onOpenRestockModal: (productId?: string) => void;
  onOpenStockOutModal: (productId?: string) => void;
}

export const StockMovementView: React.FC<StockMovementViewProps> = ({
  onOpenRestockModal,
  onOpenStockOutModal,
}) => {
  const { movements } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const todayStr = getTodayDateString();

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.productName.toLowerCase().includes(q) ||
        m.productSku.toLowerCase().includes(q) ||
        (m.referenceId && m.referenceId.toLowerCase().includes(q)) ||
        (m.notes && m.notes.toLowerCase().includes(q));

      let matchType = true;
      if (typeFilter === 'in') {
        matchType = m.qtyChange > 0;
      } else if (typeFilter === 'out_sale') {
        matchType = m.type === 'out_sale';
      } else if (typeFilter === 'out_other') {
        matchType = m.type === 'out_damaged' || m.type === 'out_internal' || m.type === 'adjust';
      }

      let matchDate = true;
      if (dateFilter === 'today') {
        matchDate = m.date === todayStr;
      }

      return matchSearch && matchType && matchDate;
    });
  }, [movements, searchQuery, typeFilter, dateFilter, todayStr]);

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'កាលបរិច្ឆេទ & ម៉ោង',
      'កូដ SKU',
      'ឈ្មោះទំនិញ',
      'ប្រភេទចលនា',
      'បរិមាណបន្លាស់ប្តូរ',
      'ស្តុកដើម',
      'ស្តុកចុងក្រោយ',
      'ថ្លៃដើម ($)',
      'លេខយោង',
      'ប្រតិបត្តិករ',
      'កំណត់សម្គាល់',
    ];

    const rows = filteredMovements.map(m => [
      `"${formatDateTimeKh(m.timestamp)}"`,
      `"${m.productSku}"`,
      `"${m.productName.replace(/"/g, '""')}"`,
      `"${m.type}"`,
      m.qtyChange,
      m.previousQty,
      m.newQty,
      m.unitCostUsd,
      `"${m.referenceId || ''}"`,
      `"${m.operator}"`,
      `"${(m.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kangmeas-stock-movements-${todayStr}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>តាមដានស្វ័យប្រវត្តិតាមពេលវេលាជាក់ស្តែង (Real-Time Auto Ledger)</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            កំណត់ហេតុចេញ-ចូលស្តុក (Stock In & Out Ledger)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            រាល់ការលក់នៅ POS និងការនាំចូលពីអ្នកផ្គត់ផ្គង់ ត្រូវបានកត់ត្រា និងកាត់ស្តុកដោយស្វ័យប្រវត្តិ
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
            onClick={() => onOpenRestockModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ នាំចូលស្តុក</span>
          </button>
          <button
            onClick={() => onOpenStockOutModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-red-300 font-bold text-xs rounded-lg border border-slate-700 transition-all"
          >
            <MinusCircle className="w-4 h-4 text-red-400" />
            <span>- កាត់ស្តុកចេញ</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះទំនិញ, SKU, លេខវិក្កយបត្រ, ឬកំណត់សម្គាល់..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              dateFilter === 'all'
                ? 'bg-slate-700 text-white font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            គ្រប់កាលបរិច្ឆេទ
          </button>
          <button
            onClick={() => setDateFilter('today')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              dateFilter === 'today'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            ថ្ងៃនេះ ({todayStr})
          </button>
        </div>

        {/* Movement Type Filter */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              typeFilter === 'all'
                ? 'bg-slate-700 text-white font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            ទាំងអស់
          </button>
          <button
            onClick={() => setTypeFilter('out_sale')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              typeFilter === 'out_sale'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-amber-400 hover:bg-slate-800'
            }`}
          >
            លក់ចេញស្វ័យប្រវត្តិ
          </button>
          <button
            onClick={() => setTypeFilter('in')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              typeFilter === 'in'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-950 text-emerald-400 hover:bg-slate-800'
            }`}
          >
            នាំចូលស្តុក
          </button>
          <button
            onClick={() => setTypeFilter('out_other')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              typeFilter === 'out_other'
                ? 'bg-red-600 text-white font-bold'
                : 'bg-slate-950 text-red-400 hover:bg-slate-800'
            }`}
          >
            ខូចខាត/កែតម្រូវ
          </button>
        </div>
      </div>

      {/* Movement Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-3 px-3.5">កាលបរិច្ឆេទ & ម៉ោង</th>
                <th className="py-3 px-3.5">កូដ SKU</th>
                <th className="py-3 px-3.5">ឈ្មោះទំនិញអគ្គិសនី</th>
                <th className="py-3 px-3.5">ប្រភេទចលនា</th>
                <th className="py-3 px-3.5 text-right">បរិមាណបន្លាស់ប្តូរ</th>
                <th className="py-3 px-3.5 text-right">ស្តុកមុន</th>
                <th className="py-3 px-3.5 text-right">ស្តុកក្រោយ</th>
                <th className="py-3 px-3.5">លេខយោង</th>
                <th className="py-3 px-3.5">ប្រតិបត្តិករ & កំណត់សម្គាល់</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-mono">
              {filteredMovements.map(m => {
                const isAddition = m.qtyChange > 0;
                return (
                  <tr key={m.id} className="hover:bg-slate-850/60 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-3.5 text-slate-400 font-sans whitespace-nowrap">
                      {formatDateTimeKh(m.timestamp)}
                    </td>

                    {/* SKU */}
                    <td className="py-3 px-3.5 font-bold text-slate-300 whitespace-nowrap">
                      {m.productSku}
                    </td>

                    {/* Product Name */}
                    <td className="py-3 px-3.5 font-sans font-medium text-slate-100 max-w-[220px]">
                      <div className="truncate">{m.productName}</div>
                    </td>

                    {/* Movement Type Badge */}
                    <td className="py-3 px-3.5 font-sans whitespace-nowrap">
                      {m.type === 'out_sale' && (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>លក់ចេញ (POS ស្វ័យប្រវត្តិ)</span>
                        </span>
                      )}
                      {m.type === 'in_purchase' && (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          <span>នាំចូលស្តុក (Restock)</span>
                        </span>
                      )}
                      {m.type === 'out_damaged' && (
                        <span className="inline-flex items-center gap-1 text-red-400 font-medium">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>ខូចខាត/បាក់បែក</span>
                        </span>
                      )}
                      {m.type === 'out_internal' && (
                        <span className="inline-flex items-center gap-1 text-blue-400 font-medium">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>ប្រើប្រាស់ការដ្ឋាន</span>
                        </span>
                      )}
                      {m.type === 'adjust' && (
                        <span className="inline-flex items-center gap-1 text-purple-400 font-medium">
                          <span>កែសម្រួលសវនកម្ម</span>
                        </span>
                      )}
                    </td>

                    {/* Delta Qty */}
                    <td className="py-3 px-3.5 text-right tabular-nums font-bold text-sm">
                      <span className={isAddition ? 'text-emerald-400' : 'text-amber-400'}>
                        {isAddition ? `+${m.qtyChange}` : m.qtyChange}
                      </span>
                    </td>

                    {/* Previous Qty */}
                    <td className="py-3 px-3.5 text-right tabular-nums text-slate-400">
                      {m.previousQty}
                    </td>

                    {/* New Qty */}
                    <td className="py-3 px-3.5 text-right tabular-nums font-bold text-white">
                      {m.newQty}
                    </td>

                    {/* Reference ID */}
                    <td className="py-3 px-3.5 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                      {m.referenceId ? (
                        <span className="bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                          {m.referenceId}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Operator & Notes */}
                    <td className="py-3 px-3.5 font-sans text-slate-400 max-w-[200px]">
                      <div className="text-[11px] text-slate-300">{m.operator}</div>
                      <div className="text-[10px] text-slate-500 truncate">{m.notes || '-'}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMovements.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            មិនទាន់មានកំណត់ហេតុចលនាស្តុកដែលត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ
          </div>
        )}
      </div>
    </div>
  );
};
