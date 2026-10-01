import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Product,
  StockMovement,
  SaleTransaction,
  SaleItem,
  CustomerType,
  DailyReportSummary,
} from '../types/inventory';
import {
  INITIAL_PRODUCTS,
  INITIAL_MOVEMENTS,
  INITIAL_TRANSACTIONS,
} from '../data/initialData';
import {
  getTodayDateString,
  generateInvoiceNumber,
  usdToKhr,
} from '../utils/formatters';

interface InventoryContextType {
  products: Product[];
  movements: StockMovement[];
  transactions: SaleTransaction[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Stock actions
  recordStockIn: (params: {
    productId: string;
    qty: number;
    unitCostUsd: number;
    supplier?: string;
    referenceId?: string;
    notes?: string;
    operator?: string;
  }) => void;
  recordStockOut: (params: {
    productId: string;
    qty: number;
    type: 'out_damaged' | 'out_internal' | 'adjust';
    notes?: string;
    operator?: string;
  }) => void;
  // Sales actions
  completeSale: (saleData: {
    customerName: string;
    customerPhone?: string;
    customerType: CustomerType;
    items: SaleItem[];
    discountUsd: number;
    paymentMethod: 'cash' | 'khqr' | 'credit';
    amountReceivedUsd?: number;
    amountReceivedKhr?: number;
    cashier?: string;
    notes?: string;
  }) => SaleTransaction;
  // Reports
  getDailyReport: (dateStr?: string) => DailyReportSummary;
  lowStockProducts: Product[];
  // Utility
  resetToDemoData: () => void;
  exportDatabaseJson: () => void;
  importDatabaseJson: (jsonStr: string) => boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEY = 'kangmeas_electrical_inventory_v1';

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_movements`);
      return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
    } catch {
      return INITIAL_MOVEMENTS;
    }
  });

  const [transactions, setTransactions] = useState<SaleTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products:', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_movements`, JSON.stringify(movements));
    } catch (e) {
      console.error('Error saving movements:', e);
    }
  }, [movements]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions:', e);
    }
  }, [transactions]);

  // Product CRUD
  const addProduct = (data: Omit<Product, 'id' | 'updatedAt'>): Product => {
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };

    setProducts(prev => [newProduct, ...prev]);

    // If initial stock is greater than zero, log initial stock movement
    if (newProduct.stockQty > 0) {
      const initMovement: StockMovement = {
        id: `MOV-${Date.now()}`,
        timestamp: new Date().toISOString(),
        date: getTodayDateString(),
        productId: newProduct.id,
        productName: newProduct.nameKh,
        productSku: newProduct.sku,
        category: newProduct.category,
        type: 'in_purchase',
        qtyChange: newProduct.stockQty,
        previousQty: 0,
        newQty: newProduct.stockQty,
        unitCostUsd: newProduct.costPriceUsd,
        referenceId: 'INIT-STOCK',
        notes: 'ស្តុកដំបូងពេលបង្កើតទំនិញថ្មី',
        operator: 'អ្នកគ្រប់គ្រងស្តុក',
      };
      setMovements(prev => [initMovement, ...prev]);
    }

    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Stock In: Purchase / Restock
  const recordStockIn = ({
    productId,
    qty,
    unitCostUsd,
    supplier,
    referenceId,
    notes,
    operator = 'អ្នកគ្រប់គ្រងស្តុក',
  }: {
    productId: string;
    qty: number;
    unitCostUsd: number;
    supplier?: string;
    referenceId?: string;
    notes?: string;
    operator?: string;
  }) => {
    const product = products.find(p => p.id === productId);
    if (!product || qty <= 0) return;

    const previousQty = product.stockQty;
    const newQty = previousQty + qty;

    // Update product stock and optionally cost price
    updateProduct(productId, {
      stockQty: newQty,
      costPriceUsd: unitCostUsd > 0 ? unitCostUsd : product.costPriceUsd,
      supplier: supplier || product.supplier,
    });

    // Create stock movement ledger entry
    const movement: StockMovement = {
      id: `MOV-${Date.now()}`,
      timestamp: new Date().toISOString(),
      date: getTodayDateString(),
      productId: product.id,
      productName: product.nameKh,
      productSku: product.sku,
      category: product.category,
      type: 'in_purchase',
      qtyChange: qty,
      previousQty,
      newQty,
      unitCostUsd: unitCostUsd > 0 ? unitCostUsd : product.costPriceUsd,
      referenceId: referenceId || `PO-${Date.now().toString().slice(-4)}`,
      notes: notes || `នាំចូលបន្ថែមពី ${supplier || product.supplier}`,
      operator,
    };

    setMovements(prev => [movement, ...prev]);
  };

  // Stock Out: Damaged, Internal Use, Audit Adjust
  const recordStockOut = ({
    productId,
    qty,
    type,
    notes,
    operator = 'បុគ្គលិកស្តុក',
  }: {
    productId: string;
    qty: number;
    type: 'out_damaged' | 'out_internal' | 'adjust';
    notes?: string;
    operator?: string;
  }) => {
    const product = products.find(p => p.id === productId);
    if (!product || qty <= 0) return;

    const previousQty = product.stockQty;
    const newQty = Math.max(0, previousQty - qty);
    const actualDeduction = previousQty - newQty;

    updateProduct(productId, { stockQty: newQty });

    const movement: StockMovement = {
      id: `MOV-${Date.now()}`,
      timestamp: new Date().toISOString(),
      date: getTodayDateString(),
      productId: product.id,
      productName: product.nameKh,
      productSku: product.sku,
      category: product.category,
      type,
      qtyChange: -actualDeduction,
      previousQty,
      newQty,
      unitCostUsd: product.costPriceUsd,
      notes: notes || (type === 'out_damaged' ? 'ទំនិញខូចគុណភាព' : 'ដកប្រើការដ្ឋានផ្ទៃក្នុង'),
      operator,
    };

    setMovements(prev => [movement, ...prev]);
  };

  // Complete POS Sale with AUTOMATED Stock-Out Deductions
  const completeSale = (saleData: {
    customerName: string;
    customerPhone?: string;
    customerType: CustomerType;
    items: SaleItem[];
    discountUsd: number;
    paymentMethod: 'cash' | 'khqr' | 'credit';
    amountReceivedUsd?: number;
    amountReceivedKhr?: number;
    cashier?: string;
    notes?: string;
  }): SaleTransaction => {
    const now = new Date();
    const dateStr = getTodayDateString();
    const invoiceId = generateInvoiceNumber(transactions.length);

    let subtotalUsd = 0;
    let totalQty = 0;

    saleData.items.forEach(item => {
      subtotalUsd += item.subtotalUsd;
      totalQty += item.qty;
    });

    const totalUsd = Math.max(0, subtotalUsd - (saleData.discountUsd || 0));
    const totalKhr = usdToKhr(totalUsd);

    let changeUsd: number | undefined;
    let changeKhr: number | undefined;

    if (saleData.paymentMethod === 'cash') {
      const receivedUsd = saleData.amountReceivedUsd || 0;
      const receivedKhrInUsd = (saleData.amountReceivedKhr || 0) / 4100;
      const totalReceivedInUsd = receivedUsd + receivedKhrInUsd;
      const diffUsd = totalReceivedInUsd - totalUsd;
      if (diffUsd > 0) {
        changeUsd = Number(diffUsd.toFixed(2));
        changeKhr = usdToKhr(diffUsd);
      }
    }

    const transaction: SaleTransaction = {
      id: invoiceId,
      timestamp: now.toISOString(),
      date: dateStr,
      customerName: saleData.customerName || 'អតិថិជនទូទៅ',
      customerPhone: saleData.customerPhone,
      customerType: saleData.customerType,
      items: saleData.items,
      totalQty,
      subtotalUsd,
      discountUsd: saleData.discountUsd || 0,
      totalUsd,
      totalKhr,
      paymentMethod: saleData.paymentMethod,
      amountReceivedUsd: saleData.amountReceivedUsd,
      amountReceivedKhr: saleData.amountReceivedKhr,
      changeUsd,
      changeKhr,
      status: saleData.paymentMethod === 'credit' ? 'pending' : 'paid',
      cashier: saleData.cashier || 'បុគ្គលិក កងមាស',
      notes: saleData.notes,
    };

    // 1. AUTOMATED STOCK DEDUCTION FOR EACH ITEM SOLD
    const newMovements: StockMovement[] = [];
    const updatedProductsMap = new Map<string, number>();

    saleData.items.forEach(item => {
      const currentProduct = products.find(p => p.id === item.productId);
      if (currentProduct) {
        const prevQty = updatedProductsMap.has(item.productId)
          ? updatedProductsMap.get(item.productId)!
          : currentProduct.stockQty;
        const newQty = Math.max(0, prevQty - item.qty);
        updatedProductsMap.set(item.productId, newQty);

        newMovements.push({
          id: `MOV-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: now.toISOString(),
          date: dateStr,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          category: item.category,
          type: 'out_sale',
          qtyChange: -item.qty,
          previousQty: prevQty,
          newQty,
          unitCostUsd: item.unitCostUsd,
          referenceId: invoiceId,
          notes: `លក់ចេញស្វ័យប្រវត្តិតាមវិក្កយបត្រ ${invoiceId} (${saleData.customerName})`,
          operator: 'ប្រព័ន្ធស្វ័យប្រវត្តិ POS',
        });
      }
    });

    // Apply product quantity updates
    setProducts(prev =>
      prev.map(p => {
        if (updatedProductsMap.has(p.id)) {
          return {
            ...p,
            stockQty: updatedProductsMap.get(p.id)!,
            updatedAt: now.toISOString(),
          };
        }
        return p;
      })
    );

    // Append automated stock movements
    setMovements(prev => [...newMovements, ...prev]);

    // Record transaction
    setTransactions(prev => [transaction, ...prev]);

    return transaction;
  };

  // Low stock products
  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stockQty <= p.minStockQty);
  }, [products]);

  // Compute Daily Report Summary for any date
  const getDailyReport = (dateStr: string = selectedDate): DailyReportSummary => {
    const dayTransactions = transactions.filter(t => t.date === dateStr);
    const dayMovements = movements.filter(m => m.date === dateStr);

    let totalSalesUsd = 0;
    let totalCostUsd = 0;
    let totalItemsSold = 0;
    let cashUsd = 0;
    let khqrUsd = 0;
    let creditUsd = 0;

    const productSalesMap = new Map<
      string,
      { productId: string; sku: string; nameKh: string; qty: number; revenueUsd: number }
    >();

    dayTransactions.forEach(t => {
      totalSalesUsd += t.totalUsd;
      if (t.paymentMethod === 'cash') cashUsd += t.totalUsd;
      else if (t.paymentMethod === 'khqr') khqrUsd += t.totalUsd;
      else if (t.paymentMethod === 'credit') creditUsd += t.totalUsd;

      t.items.forEach(item => {
        totalCostUsd += item.unitCostUsd * item.qty;
        totalItemsSold += item.qty;

        const existing = productSalesMap.get(item.productId);
        if (existing) {
          existing.qty += item.qty;
          existing.revenueUsd += item.subtotalUsd;
        } else {
          productSalesMap.set(item.productId, {
            productId: item.productId,
            sku: item.productSku,
            nameKh: item.productName,
            qty: item.qty,
            revenueUsd: item.subtotalUsd,
          });
        }
      });
    });

    const totalProfitUsd = Math.max(0, totalSalesUsd - totalCostUsd);
    const profitMarginPercent = totalSalesUsd > 0 ? (totalProfitUsd / totalSalesUsd) * 100 : 0;

    // Stock in and stock out quantities and values
    let totalStockInQty = 0;
    let totalStockInValueUsd = 0;
    let totalStockOutQty = 0;
    let totalStockOutValueUsd = 0;

    dayMovements.forEach(m => {
      if (m.qtyChange > 0) {
        totalStockInQty += m.qtyChange;
        totalStockInValueUsd += m.qtyChange * m.unitCostUsd;
      } else {
        const outQty = Math.abs(m.qtyChange);
        totalStockOutQty += outQty;
        totalStockOutValueUsd += outQty * m.unitCostUsd;
      }
    });

    const topSellingProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      date: dateStr,
      totalSalesUsd,
      totalSalesKhr: usdToKhr(totalSalesUsd),
      totalCostUsd,
      totalProfitUsd,
      profitMarginPercent,
      totalTransactionsCount: dayTransactions.length,
      totalItemsSold,
      totalStockInQty,
      totalStockInValueUsd,
      totalStockOutQty,
      totalStockOutValueUsd,
      paymentBreakdown: {
        cashUsd,
        khqrUsd,
        creditUsd,
      },
      topSellingProducts,
      lowStockItems: lowStockProducts,
    };
  };

  const resetToDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setMovements(INITIAL_MOVEMENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    localStorage.removeItem(`${STORAGE_KEY}_products`);
    localStorage.removeItem(`${STORAGE_KEY}_movements`);
    localStorage.removeItem(`${STORAGE_KEY}_transactions`);
  };

  const exportDatabaseJson = () => {
    const data = {
      appName: 'Kang Meas Electricity Inventory System',
      exportDate: new Date().toISOString(),
      products,
      movements,
      transactions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kangmeas-backup-${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabaseJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.products) && Array.isArray(data.movements) && Array.isArray(data.transactions)) {
        setProducts(data.products);
        setMovements(data.movements);
        setTransactions(data.transactions);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        movements,
        transactions,
        selectedDate,
        setSelectedDate,
        addProduct,
        updateProduct,
        deleteProduct,
        recordStockIn,
        recordStockOut,
        completeSale,
        getDailyReport,
        lowStockProducts,
        resetToDemoData,
        exportDatabaseJson,
        importDatabaseJson,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
