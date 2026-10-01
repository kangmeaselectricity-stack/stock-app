import { DailyReportSummary, Product } from '../types/inventory';
import { formatUsd, formatKhr } from '../utils/formatters';

export async function generateAiDailyAnalysis(
  summary: DailyReportSummary,
  lowStockItems: Product[]
): Promise<string> {
  const lowStockNames = lowStockItems.map(p => `${p.nameKh} (នៅសល់ ${p.stockQty} ${p.unit}, កម្រិតព្រមាន ${p.minStockQty})`).join(', ');
  const topSellers = summary.topSellingProducts.map(p => `${p.nameKh} (លក់បាន ${p.qty}, ចំណូល ${formatUsd(p.revenueUsd)})`).join('; ');

  // Try using @google/genai if API key is present in environment
  try {
    const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY);

    if (apiKey) {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
អ្នកជាអ្នកជំនាញវិភាគអាជីវកម្ម និងគ្រប់គ្រងស្តុកសំភារៈអគ្គិសនីប្រចាំហាង "កងមាស អគ្គិសនី" (Kang Meas Electricity)។
សូមធ្វើការវិភាគ និងផ្តល់របាយការណ៍សង្ខេបប្រតិបត្តិការប្រចាំថ្ងៃជាភាសាខ្មែរ ដោយសង្ខេប ច្បាស់លាស់ និងមានអនុសាសន៍ជាក់ស្តែង សម្រាប់ទិន្នន័យថ្ងៃនេះ (${summary.date})៖

- ចំណូលសរុប (Revenue): ${formatUsd(summary.totalSalesUsd)} (${formatKhr(summary.totalSalesKhr)})
- ថ្លៃដើមទំនិញលក់ (Cost): ${formatUsd(summary.totalCostUsd)}
- ប្រាក់ចំណេញដុល (Gross Profit): ${formatUsd(summary.totalProfitUsd)} (អត្រាចំណេញ ${summary.profitMarginPercent.toFixed(1)}%)
- ចំនួនវិក្កយបត្រ (Invoices): ${summary.totalTransactionsCount} វិក្កយបត្រ, សរុប ${summary.totalItemsSold} មុខទំនិញ
- ការទូទាត់: សាច់ប្រាក់ ${formatUsd(summary.paymentBreakdown.cashUsd)}, KHQR/ABA ${formatUsd(summary.paymentBreakdown.khqrUsd)}, ជំពាក់ ${formatUsd(summary.paymentBreakdown.creditUsd)}
- នាំចូលស្តុក (Stock In): ${summary.totalStockInQty} ឯកតា, តម្លៃ ${formatUsd(summary.totalStockInValueUsd)}
- នាំចេញស្តុក (Stock Out): ${summary.totalStockOutQty} ឯកតា
- ទំនិញលក់ដាច់បំផុត: ${topSellers || 'គ្មាន'}
- ទំនិញជិតអស់ស្តុកត្រូវបញ្ជាទិញបន្ទាន់: ${lowStockNames || 'ស្តុកគ្រប់គ្រាន់ទាំងអស់'}

សូមរៀបចំជារចនាសម្ព័ន្ធ ៣ ចំណុច៖
១. សង្ខេបលទ្ធផលលក់ និងចំណេញប្រចាំថ្ងៃ
២. ការវាយតម្លៃចលនាស្តុកចេញ-ចូល
៣. អនុសាសន៍យុទ្ធសាស្ត្រ និងការបញ្ជាទិញទំនិញបំពេញស្តុកបន្ទាន់
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text) {
        return response.text;
      }
    }
  } catch (err) {
    console.warn('AI generation using remote model failed, using intelligent analytical fallback:', err);
  }

  // High-precision algorithmic analysis engine in Khmer
  return generateIntelligentKhmerSummary(summary, lowStockItems);
}

export function generateIntelligentKhmerSummary(
  summary: DailyReportSummary,
  lowStockItems: Product[]
): string {
  const topProduct = summary.topSellingProducts[0];
  const lowCount = lowStockItems.length;

  let text = `📊 **សេចក្តីសង្ខេបប្រតិបត្តិការប្រចាំថ្ងៃ ហាងកងមាស អគ្គិសនី (${summary.date})**\n\n`;

  text += `**១. លទ្ធផលលក់ និងចំណូលហិរញ្ញវត្ថុ៖**\n`;
  text += `• ចំណូលសរុបសម្រេចបាន ${formatUsd(summary.totalSalesUsd)} (${formatKhr(summary.totalSalesKhr)}) តាមរយៈវិក្កយបត្រចំនួន ${summary.totalTransactionsCount} ច្បាប់។\n`;
  text += `• ប្រាក់ចំណេញដុលប៉ាន់ស្មាន ${formatUsd(summary.totalProfitUsd)} ស្មើនឹង ${summary.profitMarginPercent.toFixed(1)}% នៃចំណូលសរុប ដែលស្ថិតក្នុងកម្រិតសុខភាពហិរញ្ញវត្ថុល្អប្រសើរ។\n`;
  text += `• មធ្យោបាយទូទាត់៖ KHQR/ABA ស្មើនឹង ${formatUsd(summary.paymentBreakdown.khqrUsd)}, សាច់ប្រាក់សុទ្ធ ${formatUsd(summary.paymentBreakdown.cashUsd)}${summary.paymentBreakdown.creditUsd > 0 ? `, និងជំពាក់ ${formatUsd(summary.paymentBreakdown.creditUsd)}` : ''}។\n\n`;

  text += `**២. ការតាមដានចលនាស្តុកចេញ-ចូលស្វ័យប្រវត្តិ៖**\n`;
  text += `• ទំនិញលក់ចេញស្វ័យប្រវត្តិតាម POS៖ ចំនួន ${summary.totalStockOutQty} ឯកតា ត្រូវបានកាត់ចេញពីស្តុកភ្លាមៗក្រោយបញ្ចប់ការលក់។\n`;
  text += `• ទំនិញនាំចូលបន្ថែមពីក្រុមហ៊ុនផ្គត់ផ្គង់៖ ចំនួន ${summary.totalStockInQty} ឯកតា សរុបជាទឹកប្រាក់ថ្លៃដើម ${formatUsd(summary.totalStockInValueUsd)}។\n`;
  if (topProduct) {
    text += `• ទំនិញលក់ដាច់ចំណាត់ថ្នាក់លេខ ១៖ **${topProduct.nameKh}** លក់បានចំនួន ${topProduct.qty} បង្កើតចំណូលបាន ${formatUsd(topProduct.revenueUsd)}។\n\n`;
  } else {
    text += `\n`;
  }

  text += `**៣. អនុសាសន៍គ្រប់គ្រងស្តុក និងការបញ្ជាទិញបន្ទាន់៖**\n`;
  if (lowCount > 0) {
    text += `⚠️ រកឃើញទំនិញចំនួន **${lowCount} មុខ** កំពុងធ្លាក់ចុះដល់កម្រិតព្រមានជិតអស់ស្តុក៖\n`;
    lowStockItems.slice(0, 4).forEach((item, idx) => {
      text += `  ${idx + 1}. **${item.nameKh}** (នៅសល់តែ ${item.stockQty} ${item.unit} / គួររក្សាទុកយ៉ាងតិច ${item.minStockQty} ${item.unit}) -> ស្នើឱ្យចេញ Purchase Order ទៅកាន់ ${item.supplier} ជាបន្ទាន់។\n`;
    });
  } else {
    text += `✅ ស្តុកទំនិញអគ្គិសនីគ្រប់ប្រភេទទាំងអស់ស្ថិតក្នុងកម្រិតមានសុវត្ថិភាព មិនទាន់មានទំនិញខ្វះខាតធ្ងន់ធ្ងរនៅឡើយទេ។\n`;
  }
  text += `💡 គួរត្រៀមបំពេញស្តុកខ្សែភ្លើង និងឌីសង់ទ័របន្ថែមសម្រាប់គម្រោងជាងភ្លើងចុងសប្តាហ៍។`;

  return text;
}
