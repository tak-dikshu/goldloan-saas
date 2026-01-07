/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format weight with precision
 */
export function formatWeight(weight: number, decimals: number = 3): string {
  return weight.toFixed(decimals) + 'g';
}

/**
 * Format date in Indian format
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format date for input fields
 */
export function formatDateForInput(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Calculate net weight
 */
export function calculateNetWeight(grossWeight: number, stoneWeight: number): number {
  return Math.max(0, grossWeight - stoneWeight);
}

/**
 * Calculate gold value
 */
export function calculateGoldValue(netWeight: number, ratePerGram: number): number {
  return Math.round(netWeight * ratePerGram);
}

/**
 * Calculate interest amount
 */
export function calculateInterest(
  principal: number,
  rate: number,
  days: number
): number {
  return Math.round((principal * rate * days) / (100 * 30));
}

/**
 * Calculate due date
 */
export function calculateDueDate(startDate: string, tenureDays: number): string {
  const start = new Date(startDate);
  start.setDate(start.getDate() + tenureDays);
  return start.toISOString().split('T')[0];
}

/**
 * Check if loan is overdue
 */
export function isLoanOverdue(dueDate: string, status: string): boolean {
  if (status === 'closed') return false;
  return new Date(dueDate) < new Date();
}

/**
 * Get purity display name
 */
export function getPurityDisplay(purity: string): string {
  const purityMap: Record<string, string> = {
    '24K': '24 Karat (99.9%)',
    '22K': '22 Karat (91.6%)',
    '18K': '18 Karat (75.0%)',
    '916': '91.6% (22K)',
    '750': '75.0% (18K)',
  };
  return purityMap[purity] || purity;
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    overdue: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

/**
 * Validate email
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Generate loan number
 */
export function generateLoanNumber(): string {
  return 'LN' + Date.now().toString().slice(-8);
}

/**
 * Download file
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return value.toFixed(2) + '%';
}

/**
 * Calculate days between dates
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
