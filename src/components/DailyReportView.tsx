import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Printer, 
  FileSpreadsheet, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Award, 
  CreditCard, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { formatUsd, formatKhr, getTodayDateString, formatDateKh } from '../utils/formatters';
import { generateAiDailyAnalysis } from '../services/aiReportService';

export const DailyReportView: React.FC = () => {
  const { 
    selectedDate, 
    setSelectedDate, 
    getDailyReport, 
    lowStockProducts, 
    transactions,
    movements 
  } = useInventory();

  const [dateInput, setDateInput] = useState<string>(selectedDate);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  const report = getDailyReport(dateInput);

  // Generate initial summary or reload when date changes
  useEffect(() => {
    handleGenerateAiAnalysis();
  }, [dateInput]);

  const handleGenerateAiAnalysis = async () => {
    setIsGeneratingAi(true);
    try {
      const result = await generateAiDailyAnalysis(report, lowStockProducts);
      setAiAnalysis(result);
    } catch (e) {
      console.error('Failed to generate summary', e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = [
      'កាលបរិច្ឆេទ',
      'ចំណូលសរុប ($)',
      'ចំណូលសរុប (៛)',
      'ថ្លៃដើម ($)',
      'ចំណេញដុល ($)',
      'អត្រាចំណេញ (%)',
      'ចំនួនវិក្កយបត្រ',
      'បរិមាណទំនិញលក់',
      'នាំចូលស្តុក (ឯកតា)',
      'ទឹកប្រាក់នាំចូល ($)',
      'នាំចេញស្តុក (ឯកតា)',
      'ទូទាត់សាច់ប្រាក់ ($)',
      'ទូទាត់ KHQR ($)',
      'ជំពាក់ ($)',
    ];

    const row = [
      dateInput,
      report.totalSalesUsd,
      report.totalSalesKhr,
      report.totalCostUsd,
      report.totalProfitUsd,
      report.profitMarginPercent.toFixed(2),
      report.totalTransactionsCount,
      report.totalItemsSold,
      report.totalStockInQty,
      report.totalStockInValueUsd,
      report.totalStockOutQty,
      report.paymentBreakdown.cashUsd,
      report.paymentBreakdown.khqrUsd,
      report.paymentBreakdown.creditUsd,
    ];

    const csvContent = '\uFEFF' + [headers.join(','), row.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kangmeas-daily-report-${dateInput}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const todayStr = getTodayDateString();

  return (
    <div className="space-y-6">
      {/* Top Banner and Date Picker */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>របាយការណ៍សង្ខេបអាជីវកម្មប្រចាំថ្ងៃ (Daily Operations Summary)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              របាយការណ៍ប្រចាំថ្ងៃ ៖ {formatDateKh(dateInput)}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              សង្ខេបលទ្ធផលលក់ ចំណូល ចំណេញ ចលនាស្តុកចេញ-ចូល និងការវិភាគដោយ AI
            </p>
          </div>

          {/* Controls: Date Picker & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg p-1">
              <input
                type="date"
                value={dateInput}
                onChange={e => {
                  setDateInput(e.target.value);
                  setSelectedDate(e.target.value);
                }}
                className="bg-transparent text-xs text-slate-200 px-2 py-1 font-mono focus:outline-hidden"
              />
              <button
                onClick={() => {
                  setDateInput(todayStr);
                  setSelectedDate(todayStr);
                }}
                className={`px-2 py-1 text-[11px] rounded-md transition-colors ${
                  dateInput === todayStr
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ថ្ងៃនេះ
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>បោះពុម្ពរបាយការណ៍</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>ទាញយក CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Report Header Container (Used in print) */}
      <div className="hidden print-only mb-6 text-center">
        <h1 className="text-xl font-bold font-sans">ហាង កងមាស អគ្គិសនី (KANG MEAS ELECTRICITY)</h1>
        <p className="text-xs text-slate-600">របាយការណ៍សង្ខេបប្រតិបត្តិការប្រចាំថ្ងៃ ៖ {formatDateKh(dateInput)}</p>
        <p className="text-[10px] text-slate-500">កាលបរិច្ឆេទបោះពុម្ព៖ {new Date().toLocaleString()}</p>
        <hr className="my-3 border-slate-300" />
      </div>

      {/* KPI Cards (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 print:bg-white print:border-slate-300">
          <div className="flex items-center justify-between text-xs text-slate-400 print:text-slate-600">
            <span>ចំណូលសរុប (Total Revenue)</span>
            <span className="p-1 rounded-md bg-emerald-950/80 text-emerald-400 no-print">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-white print:text-slate-900 tabular-nums">
              {formatUsd(report.totalSalesUsd)}
            </div>
            <div className="text-xs font-mono text-emerald-400 print:text-emerald-700 tabular-nums mt-0.5">
              ≈ {formatKhr(report.totalSalesKhr)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 print:border-slate-200 flex justify-between">
            <span>វិក្កយបត្រ៖ <strong className="text-slate-200 print:text-slate-900 font-mono">{report.totalTransactionsCount}</strong></span>
            <span>ទំនិញលក់បាន៖ <strong className="text-slate-200 print:text-slate-900 font-mono">{report.totalItemsSold}</strong></span>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 print:bg-white print:border-slate-300">
          <div className="flex items-center justify-between text-xs text-slate-400 print:text-slate-600">
            <span>ប្រាក់ចំណេញដុល (Gross Profit)</span>
            <span className="p-1 rounded-md bg-blue-950/80 text-blue-400 no-print">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-white print:text-slate-900 tabular-nums">
              {formatUsd(report.totalProfitUsd)}
            </div>
            <div className="text-xs font-mono text-blue-400 print:text-blue-700 tabular-nums mt-0.5">
              អត្រាចំណេញ {report.profitMarginPercent.toFixed(1)}%
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 print:border-slate-200 flex justify-between">
            <span>ថ្លៃដើមទំនិញលក់៖</span>
            <strong className="text-slate-300 print:text-slate-800 font-mono">{formatUsd(report.totalCostUsd)}</strong>
          </div>
        </div>

        {/* Stock Out */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 print:bg-white print:border-slate-300">
          <div className="flex items-center justify-between text-xs text-slate-400 print:text-slate-600">
            <span>ទំនិញចេញពីស្តុក (Stock Out)</span>
            <span className="p-1 rounded-md bg-amber-950/80 text-amber-400 no-print">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-white print:text-slate-900 tabular-nums">
              {report.totalStockOutQty} <span className="text-xs font-normal text-slate-400">ឯកតា</span>
            </div>
            <div className="text-xs font-mono text-amber-400 print:text-amber-700 tabular-nums mt-0.5">
              ថ្លៃដើម {formatUsd(report.totalStockOutValueUsd)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 print:border-slate-200">
            <span>កាត់ស្តុកស្វ័យប្រវត្តិតាម POS</span>
          </div>
        </div>

        {/* Stock In */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 print:bg-white print:border-slate-300">
          <div className="flex items-center justify-between text-xs text-slate-400 print:text-slate-600">
            <span>ទំនិញនាំចូលស្តុក (Stock In)</span>
            <span className="p-1 rounded-md bg-purple-950/80 text-purple-400 no-print">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-white print:text-slate-900 tabular-nums">
              {report.totalStockInQty} <span className="text-xs font-normal text-slate-400">ឯកតា</span>
            </div>
            <div className="text-xs font-mono text-purple-400 print:text-purple-700 tabular-nums mt-0.5">
              ទឹកប្រាក់ {formatUsd(report.totalStockInValueUsd)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 print:border-slate-200">
            <span>នាំចូលពីក្រុមហ៊ុនផ្គត់ផ្គង់</span>
          </div>
        </div>
      </div>

      {/* AI Daily Analysis Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 print:bg-white print:border-slate-300">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 print:border-slate-300">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 no-print">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white print:text-slate-900">
                ការវិភាគសង្ខេបប្រតិបត្តិការ និងអនុសាសន៍ស្តុក (AI Daily Business Insight)
              </h2>
              <span className="text-[11px] text-slate-400 print:text-slate-500 font-sans">
                សង្ខេបដោយស្វ័យប្រវត្តិនូវចំណុចខ្លាំង បញ្ហាប្រឈម និងទំនិញដែលត្រូវបញ្ជាទិញបន្ថែម
              </span>
            </div>
          </div>

          <button
            disabled={isGeneratingAi}
            onClick={handleGenerateAiAnalysis}
            className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isGeneratingAi ? 'animate-spin' : ''}`} />
            <span>{isGeneratingAi ? 'កំពុងវិភាគ...' : 'វិភាគឡើងវិញ'}</span>
          </button>
        </div>

        <div className="mt-4 text-xs leading-relaxed text-slate-300 print:text-slate-800 whitespace-pre-line font-sans bg-slate-950/60 print:bg-transparent p-4 rounded-xl border border-slate-800/80 print:border-none">
          {aiAnalysis || 'កំពុងដំណើរការវិភាគទិន្នន័យ...'}
        </div>
      </div>

      {/* Split Section: Top Selling Items & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Selling Electrical Products (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 print:bg-white print:border-slate-300">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white print:text-slate-900">
              ទំនិញលក់ដាច់បំផុតប្រចាំថ្ងៃ (Top Selling Electrical Items)
            </h2>
          </div>

          {report.topSellingProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              មិនទាន់មានការលក់សម្រាប់កាលបរិច្ឆេទនេះឡើយ
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 font-medium">
                    <th className="py-2 px-2 text-center w-8">#</th>
                    <th className="py-2 px-3">ឈ្មោះទំនិញ</th>
                    <th className="py-2 px-3 text-right">បរិមាណលក់</th>
                    <th className="py-2 px-3 text-right">ចំណូល ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-slate-200 font-mono">
                  {report.topSellingProducts.map((p, idx) => (
                    <tr key={p.productId} className="hover:bg-slate-850/40">
                      <td className="py-2.5 px-2 text-center text-slate-400 font-bold">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-medium text-slate-200 print:text-slate-900">{p.nameKh}</div>
                        <div className="text-[10px] text-slate-500">{p.sku}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-200 print:text-slate-900 tabular-nums">
                        {p.qty}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400 print:text-emerald-700 tabular-nums">
                        {formatUsd(p.revenueUsd)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Breakdown & Low Stock Urgency (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Payment breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 print:bg-white print:border-slate-300">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white print:text-slate-900">
                មធ្យោបាយទូទាត់ប្រាក់ (Payment Breakdown)
              </h2>
            </div>

            <div className="space-y-3 text-xs font-mono">
              {/* KHQR */}
              <div className="p-3 bg-slate-950/70 print:bg-slate-100 rounded-lg border border-slate-800 print:border-slate-200 flex items-center justify-between">
                <div className="font-sans">
                  <div className="font-medium text-slate-200 print:text-slate-900">ស្កេន KHQR (ABA / Bakong)</div>
                  <div className="text-[10px] text-slate-500">ផ្ទេរតាមធនាគារឌីជីថល</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-400 print:text-emerald-700 tabular-nums">
                    {formatUsd(report.paymentBreakdown.khqrUsd)}
                  </div>
                  <div className="text-[10px] text-slate-400 tabular-nums">
                    {formatKhr(report.paymentBreakdown.khqrUsd * 4100)}
                  </div>
                </div>
              </div>

              {/* Cash */}
              <div className="p-3 bg-slate-950/70 print:bg-slate-100 rounded-lg border border-slate-800 print:border-slate-200 flex items-center justify-between">
                <div className="font-sans">
                  <div className="font-medium text-slate-200 print:text-slate-900">សាច់ប្រាក់សុទ្ធ (Cash)</div>
                  <div className="text-[10px] text-slate-500">ក្រដាសប្រាក់ដុល្លារ/រៀល</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-400 print:text-blue-700 tabular-nums">
                    {formatUsd(report.paymentBreakdown.cashUsd)}
                  </div>
                  <div className="text-[10px] text-slate-400 tabular-nums">
                    {formatKhr(report.paymentBreakdown.cashUsd * 4100)}
                  </div>
                </div>
              </div>

              {/* Credit */}
              <div className="p-3 bg-slate-950/70 print:bg-slate-100 rounded-lg border border-slate-800 print:border-slate-200 flex items-center justify-between">
                <div className="font-sans">
                  <div className="font-medium text-slate-200 print:text-slate-900">ជំពាក់ (Credit)</div>
                  <div className="text-[10px] text-slate-500">គម្រោងមិនទាន់ទូទាត់</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-400 print:text-amber-700 tabular-nums">
                    {formatUsd(report.paymentBreakdown.creditUsd)}
                  </div>
                  <div className="text-[10px] text-slate-400 tabular-nums">
                    {formatKhr(report.paymentBreakdown.creditUsd * 4100)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Low Stock Warning Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 print:bg-white print:border-slate-300">
            <div className="flex items-center gap-2 mb-3 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <h2 className="text-sm font-bold text-white print:text-slate-900">
                ទំនិញដែលត្រូវបញ្ជាទិញបន្ទាន់ ({lowStockProducts.length})
              </h2>
            </div>

            <div className="space-y-2 text-xs">
              {lowStockProducts.slice(0, 3).map(p => (
                <div
                  key={p.id}
                  className="p-2.5 bg-slate-950/60 print:bg-slate-100 rounded-lg border border-slate-800 print:border-slate-200 flex justify-between items-center"
                >
                  <div className="truncate max-w-[200px]">
                    <div className="font-medium text-slate-200 print:text-slate-900 truncate">{p.nameKh}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{p.supplier}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-red-400 print:text-red-700">
                      សល់ {p.stockQty} {p.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
