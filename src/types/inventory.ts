export type Category = 
  | 'all'
  | 'cables'       // ខ្សែភ្លើង & ខ្សែកាប
  | 'breakers'     // ឌីសង់ទ័រ & ប្រអប់ភ្លើង
  | 'lighting'     // អំពូល & បរិក្ខារបំភ្លឺ
  | 'switches'     // កុងតាក់ & ព្រីភ្លើង
  | 'conduits'     // បំពង់ & គ្រឿងតំណ
  | 'accessories'; // ឧបករណ៍វាស់ & គ្រឿងបន្លាស់

export interface CategoryInfo {
  id: Category;
  nameKh: string;
  nameEn: string;
  iconName: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  nameKh: string;
  nameEn: string;
  category: Exclude<Category, 'all'>;
  unit: string; // e.g. ដុំ, ម៉ែត្រ, គ្រាប់, ឈុត, ប្រអប់, ដើម
  costPriceUsd: number;
  salePriceUsd: number;
  stockQty: number;
  minStockQty: number;
  location: string; // e.g. ធ្នើ A-1, ឃ្លាំង C-02
  supplier: string;
  description?: string;
  updatedAt: string;
}

export type StockMovementType = 
  | 'in_purchase'  // នាំចូលពីអ្នកផ្គត់ផ្គង់ (Restock)
  | 'out_sale'     // លក់ចេញស្វ័យប្រវត្តិ (POS Automated Sale)
  | 'out_damaged'  // ខូចខាត/បាត់បង់ (Damaged/Lost)
  | 'out_internal' // ប្រើប្រាស់ផ្ទៃក្នុង/ការដ្ឋាន (Internal Use)
  | 'adjust'       // កែសម្រួលស្តុកជាក់ស្តែង (Manual Audit Adjustment)
  | 'in_return';   // អតិថិជនប្តូរចូលវិញ (Return)

export interface StockMovement {
  id: string;
  timestamp: string;
  date: string; // YYYY-MM-DD
  productId: string;
  productName: string;
  productSku: string;
  category: Exclude<Category, 'all'>;
  type: StockMovementType;
  qtyChange: number; // positive for addition, negative for deduction
  previousQty: number;
  newQty: number;
  unitCostUsd: number;
  referenceId?: string; // e.g. INV-20261001-001 or PO-104
  notes?: string;
  operator: string;
}

export interface SaleItem {
  productId: string;
  productSku: string;
  productName: string;
  category: Exclude<Category, 'all'>;
  unit: string;
  qty: number;
  unitPriceUsd: number;
  unitCostUsd: number;
  discountPercent: number;
  subtotalUsd: number;
}

export type CustomerType = 'retail' | 'electrician' | 'project';

export interface SaleTransaction {
  id: string; // e.g. INV-20261001-001
  timestamp: string;
  date: string; // YYYY-MM-DD
  customerName: string;
  customerPhone?: string;
  customerType: CustomerType;
  items: SaleItem[];
  totalQty: number;
  subtotalUsd: number;
  discountUsd: number;
  totalUsd: number;
  totalKhr: number;
  paymentMethod: 'cash' | 'khqr' | 'credit';
  amountReceivedUsd?: number;
  amountReceivedKhr?: number;
  changeUsd?: number;
  changeKhr?: number;
  status: 'paid' | 'pending';
  cashier: string;
  notes?: string;
}

export interface DailyReportSummary {
  date: string;
  totalSalesUsd: number;
  totalSalesKhr: number;
  totalCostUsd: number;
  totalProfitUsd: number;
  profitMarginPercent: number;
  totalTransactionsCount: number;
  totalItemsSold: number;
  totalStockInQty: number;
  totalStockInValueUsd: number;
  totalStockOutQty: number;
  totalStockOutValueUsd: number;
  paymentBreakdown: {
    cashUsd: number;
    khqrUsd: number;
    creditUsd: number;
  };
  topSellingProducts: {
    productId: string;
    sku: string;
    nameKh: string;
    qty: number;
    revenueUsd: number;
  }[];
  lowStockItems: Product[];
}
