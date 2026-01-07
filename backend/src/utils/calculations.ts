/**
 * Convert rupees to paise (integer)
 * This ensures no floating-point errors in financial calculations
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees (float for display)
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Calculate net weight (gross weight - stone weight)
 */
export function calculateNetWeight(grossWeight: number, stoneWeight: number): number {
  return Math.max(0, grossWeight - stoneWeight);
}

/**
 * Calculate gold value based on weight, purity, and rate
 */
export function calculateGoldValue(netWeightGrams: number, goldRatePerGram: number): number {
  // Returns value in paise
  const valueInRupees = netWeightGrams * goldRatePerGram;
  return rupeesToPaise(valueInRupees);
}

/**
 * Calculate due date based on start date and tenure
 */
export function calculateDueDate(startDate: Date, tenureMonths: number): Date {
  const dueDate = new Date(startDate);
  dueDate.setMonth(dueDate.getMonth() + tenureMonths);
  return dueDate;
}

/**
 * Calculate number of days between two dates
 */
export function daysBetween(startDate: Date, endDate: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  return Math.floor((end.getTime() - start.getTime()) / msPerDay);
}

/**
 * Calculate simple interest for a given period
 * Interest = Principal × Rate × Days / 36500
 * (Using 36500 = 365 days × 100 for percentage)
 */
export function calculateInterest(
  principalPaise: number,
  ratePercent: number,
  days: number
): number {
  // Calculate interest in paise
  const interest = (principalPaise * ratePercent * days) / 36500;
  return Math.round(interest);
}

/**
 * Calculate accrued interest from start date to current date
 */
export function calculateAccruedInterest(
  principalPaise: number,
  ratePercent: number,
  startDate: Date,
  currentDate: Date = new Date()
): number {
  const days = daysBetween(startDate, currentDate);
  return calculateInterest(principalPaise, ratePercent, Math.max(0, days));
}

/**
 * Generate unique loan number
 * Format: LN-YYYYMMDD-XXXXX
 */
export function generateLoanNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
  return `LN-${year}${month}${day}-${random}`;
}

/**
 * Generate unique payment number
 * Format: PY-YYYYMMDD-XXXXX
 */
export function generatePaymentNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
  return `PY-${year}${month}${day}-${random}`;
}

/**
 * Format date to Indian format (DD/MM/YYYY)
 */
export function formatDateIndian(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format currency in Indian format (₹ X,XX,XXX.XX)
 */
export function formatCurrency(rupees: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Format weight with precision
 */
export function formatWeight(grams: number): string {
  return `${grams.toFixed(3)} g`;
}

/**
 * Check if loan is overdue
 */
export function isLoanOverdue(dueDate: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today;
}

/**
 * Unix timestamp to Date
 */
export function timestampToDate(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

/**
 * Date to Unix timestamp
 */
export function dateToTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}
