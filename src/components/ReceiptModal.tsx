import React from 'react';
import { Printer, CheckCircle, X, Download } from 'lucide-react';
import { SaleTransaction } from '../types/inventory';
import { formatUsd, formatKhr, formatDateTimeKh } from '../utils/formatters';

interface ReceiptModalProps {
  transaction: SaleTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header Actions (hidden in print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-bold">ការលក់បានជោគជ័យ</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Content */}
        <div id="receipt-print-area" className="py-4 space-y-4 text-xs font-mono">
          {/* Store Brand */}
          <div className="text-center space-y-1">
            <h2 className="text-base font-bold font-sans tracking-tight text-slate-950">
              ហាង កងមាស អគ្គិសនី
            </h2>
            <div className="text-[11px] text-slate-600">
              KANG MEAS ELECTRICAL SUPPLIES
            </div>
            <div className="text-[10px] text-slate-500 font-sans">
              ភូមិស្វាយពោធិ៍ ស្រុកកងមាស ខេត្តកំពង់ចាម
            </div>
            <div className="text-[10px] text-slate-500">
              ទូរស័ព្ទ៖ 012 889 900 / 098 765 432
            </div>
            <div className="pt-2 text-xs font-bold border-t border-dashed border-slate-300">
              វិក្កយបត្រលក់ / OFFICIAL INVOICE
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-500">លេខវិក្កយបត្រ:</span>
              <span className="font-bold text-slate-950">{transaction.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">កាលបរិច្ឆេទ:</span>
              <span>{formatDateTimeKh(transaction.timestamp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">អតិថិជន:</span>
              <span className="font-sans font-semibold text-slate-950">
                {transaction.customerName} {transaction.customerPhone ? `(${transaction.customerPhone})` : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">អ្នកគិតលុយ:</span>
              <span className="font-sans">{transaction.cashier}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="grid grid-cols-12 font-bold text-slate-700 pb-1 border-b border-slate-200 text-[10px]">
              <div className="col-span-6">ទំនិញ</div>
              <div className="col-span-2 text-center">បរិមាណ</div>
              <div className="col-span-2 text-right">តម្លៃ</div>
              <div className="col-span-2 text-right">សរុប</div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {transaction.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 text-[11px] items-start">
                  <div className="col-span-6 font-sans">
                    <div className="font-medium text-slate-950 leading-tight">
                      {item.productName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {item.productSku}
                    </div>
                  </div>
                  <div className="col-span-2 text-center tabular-nums">
                    {item.qty} {item.unit}
                  </div>
                  <div className="col-span-2 text-right tabular-nums">
                    {formatUsd(item.unitPriceUsd)}
                  </div>
                  <div className="col-span-2 text-right font-bold tabular-nums">
                    {formatUsd(item.subtotalUsd)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-dashed border-slate-300 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>សរុបរង (Subtotal):</span>
              <span className="tabular-nums font-semibold">{formatUsd(transaction.subtotalUsd)}</span>
            </div>
            {transaction.discountUsd > 0 && (
              <div className="flex justify-between text-red-600">
                <span>បញ្ចុះតម្លៃ (Discount):</span>
                <span className="tabular-nums">-{formatUsd(transaction.discountUsd)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-950 border-t border-slate-300 pt-1.5">
              <span>សរុបដុល្លារ (Total USD):</span>
              <span className="tabular-nums">{formatUsd(transaction.totalUsd)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-emerald-700">
              <span>សរុបប្រាក់រៀល (Total KHR):</span>
              <span className="tabular-nums">{formatKhr(transaction.totalKhr)}</span>
            </div>

            {/* Payment Details */}
            <div className="pt-2 border-t border-dashed border-slate-300 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">វិធីទូទាត់:</span>
                <span className="font-semibold text-slate-800">
                  {transaction.paymentMethod === 'khqr' && 'ស្កេន KHQR (ABA Bakong)'}
                  {transaction.paymentMethod === 'cash' && 'សាច់ប្រាក់សុទ្ធ'}
                  {transaction.paymentMethod === 'credit' && 'ជំពាក់ (Credit)'}
                </span>
              </div>
              {transaction.amountReceivedUsd !== undefined && transaction.amountReceivedUsd > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>ប្រាក់ទទួល:</span>
                  <span className="tabular-nums">{formatUsd(transaction.amountReceivedUsd)}</span>
                </div>
              )}
              {transaction.changeUsd !== undefined && transaction.changeUsd > 0 && (
                <div className="flex justify-between text-slate-950 font-bold">
                  <span>ប្រាក់អាប់:</span>
                  <span className="tabular-nums">
                    {formatUsd(transaction.changeUsd)} / {formatKhr(transaction.changeKhr || 0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Receipt Footer */}
          <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500 font-sans space-y-1">
            <div>អរគុណចំពោះការគាំទ្រ ហាង កងមាស អគ្គិសនី!</div>
            <div>ទំនិញទិញហើយមិនអាចដូរយកប្រាក់វិញបានទេ · សូមពិនិត្យទំនិញមុនចាកចេញ</div>
            <div className="text-[9px] text-slate-400 font-mono pt-1">
              *** ប្រព័ន្ធកាត់ស្តុកស្វ័យប្រវត្តិតាម POS ***
            </div>
          </div>
        </div>

        {/* Footer Buttons (hidden in print) */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-200 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-xs shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>បោះពុម្ពវិក្កយបត្រ (Print)</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition-colors"
          >
            បិទ
          </button>
        </div>
      </div>
    </div>
  );
};
