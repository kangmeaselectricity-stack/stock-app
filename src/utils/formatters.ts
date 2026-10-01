export const USD_TO_KHR_RATE = 4100;

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function formatKhr(amount: number): string {
  const rounded = Math.round(amount || 0);
  return new Intl.NumberFormat('km-KH').format(rounded) + ' ៛';
}

export function usdToKhr(usd: number): number {
  return Math.round((usd || 0) * USD_TO_KHR_RATE);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num || 0);
}

export function formatDateKh(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export function formatDateTimeKh(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
  } catch {
    return isoStr;
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateInvoiceNumber(existingCount: number = 0): string {
  const today = getTodayDateString().replace(/-/g, '');
  const seq = String(existingCount + 1).padStart(4, '0');
  return `KM-${today}-${seq}`;
}

export function getStockStatus(stockQty: number, minStockQty: number): {
  labelKh: string;
  labelEn: string;
  variant: 'danger' | 'warning' | 'success';
} {
  if (stockQty <= 0) {
    return { labelKh: 'អស់ស្តុក', labelEn: 'Out of Stock', variant: 'danger' };
  }
  if (stockQty <= minStockQty) {
    return { labelKh: 'ជិតអស់ស្តុក', labelEn: 'Low Stock', variant: 'warning' };
  }
  return { labelKh: 'មានស្តុក', labelEn: 'In Stock', variant: 'success' };
}
