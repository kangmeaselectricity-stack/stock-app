import React, { useState, useMemo } from 'react';
import { Search, Printer, FileText, Calendar, CreditCard, DollarSign, QrCode } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { SaleTransaction } from '../types/inventory';
import { formatUsd, formatKhr, formatDateTimeKh } from '../utils/formatters';
import { ReceiptModal } from './ReceiptModal';

export const SalesInvoiceView: React.FC = () => {
  const { transactions } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<SaleTransaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        (t.customerPhone && t.customerPhone.includes(q)) ||
        (t.notes && t.notes.toLowerCase().includes(q));

      const matchMethod = methodFilter === 'all' || t.paymentMethod === methodFilter;

      return matchSearch && matchMethod;
    });
  }, [transactions, searchQuery, methodFilter]);

  const handleViewReceipt = (tx: SaleTransaction) => {
    setSelectedTransaction(tx);
    setShowReceipt(true);
  };

  const totalSalesUsd = filteredTransactions.reduce((acc, t) => acc + t.totalUsd, 0);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            បញ្ជីវិក្កយបត្រលក់ (Sales Invoices & Receipts)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            ប្រវត្តិវិក្កយបត្រលក់ចេញ បោះពុម្ពឡើងវិញ និងផ្ទៀងផ្ទាត់ការទូទាត់
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">សរុបវិក្កយបត្រក្នុងបញ្ជី៖ </span>
          <strong className="text-base font-bold font-mono text-amber-400 tabular-nums">
            {formatUsd(totalSalesUsd)}
          </strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរកតាមលេខវិក្កយបត្រ, ឈ្មោះអតិថិជន, លេខទូរស័ព្ទ..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* Method filter */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setMethodFilter('all')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              methodFilter === 'all'
                ? 'bg-slate-700 text-white font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            ទាំងអស់ ({transactions.length})
          </button>
          <button
            onClick={() => setMethodFilter('khqr')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              methodFilter === 'khqr'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-950 text-emerald-400 hover:bg-slate-800'
            }`}
          >
            KHQR/ABA
          </button>
          <button
            onClick={() => setMethodFilter('cash')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              methodFilter === 'cash'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-950 text-blue-400 hover:bg-slate-800'
            }`}
          >
            សាច់ប្រាក់
          </button>
          <button
            onClick={() => setMethodFilter('credit')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              methodFilter === 'credit'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-slate-950 text-amber-400 hover:bg-slate-800'
            }`}
          >
            ជំពាក់
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-3 px-3.5">លេខវិក្កយបត្រ</th>
                <th className="py-3 px-3.5">កាលបរិច្ឆេទ & ម៉ោង</th>
                <th className="py-3 px-3.5">អតិថិជន</th>
                <th className="py-3 px-3.5">ប្រភេទ</th>
                <th className="py-3 px-3.5 text-center">ចំនួនមុខ</th>
                <th className="py-3 px-3.5">វិធីទូទាត់</th>
                <th className="py-3 px-3.5 text-right">សរុបដុល្លារ ($)</th>
                <th className="py-3 px-3.5 text-right">សរុបរៀល (៛)</th>
                <th className="py-3 px-3.5 text-center">ស្ថានភាព</th>
                <th className="py-3 px-3.5 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-mono">
              {filteredTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-850/60 transition-colors">
                  {/* Invoice ID */}
                  <td className="py-3 px-3.5 font-bold text-amber-400 whitespace-nowrap">
                    {tx.id}
                  </td>

                  {/* Date & Time */}
                  <td className="py-3 px-3.5 text-slate-400 font-sans whitespace-nowrap">
                    {formatDateTimeKh(tx.timestamp)}
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-3.5 font-sans">
                    <div className="font-medium text-slate-100">{tx.customerName}</div>
                    {tx.customerPhone && (
                      <div className="text-[10px] text-slate-500 font-mono">{tx.customerPhone}</div>
                    )}
                  </td>

                  {/* Customer Type */}
                  <td className="py-3 px-3.5 font-sans text-slate-400">
                    {tx.customerType === 'electrician' && 'ជាងភ្លើង'}
                    {tx.customerType === 'project' && 'គម្រោង'}
                    {tx.customerType === 'retail' && 'ទូទៅ'}
                  </td>

                  {/* Total Qty */}
                  <td className="py-3 px-3.5 text-center tabular-nums text-slate-300">
                    {tx.totalQty} មុខ
                  </td>

                  {/* Payment Method */}
                  <td className="py-3 px-3.5 font-sans whitespace-nowrap">
                    {tx.paymentMethod === 'khqr' && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>KHQR</span>
                      </span>
                    )}
                    {tx.paymentMethod === 'cash' && (
                      <span className="text-blue-400 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>សាច់ប្រាក់</span>
                      </span>
                    )}
                    {tx.paymentMethod === 'credit' && (
                      <span className="text-amber-400 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>ជំពាក់</span>
                      </span>
                    )}
                  </td>

                  {/* Total USD */}
                  <td className="py-3 px-3.5 text-right font-bold text-white tabular-nums">
                    {formatUsd(tx.totalUsd)}
                  </td>

                  {/* Total KHR */}
                  <td className="py-3 px-3.5 text-right text-slate-400 tabular-nums">
                    {formatKhr(tx.totalKhr)}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3.5 text-center font-sans">
                    {tx.status === 'paid' ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        បានទូទាត់
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                        រង់ចាំទូទាត់
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3.5 text-right font-sans whitespace-nowrap">
                    <button
                      onClick={() => handleViewReceipt(tx)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium border border-slate-700 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>វិក្កយបត្រ</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            មិនមានវិក្កយបត្រដែលត្រូវនឹងការស្វែងរកឡើយ
          </div>
        )}
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        transaction={selectedTransaction}
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
      />
    </div>
  );
};
