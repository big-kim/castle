import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTokenAmount(amount: number, decimals: number = 8): string {
  return amount.toFixed(decimals);
}

export function formatCurrency(amount: number | undefined | null, currency: string = 'USDT'): string {
  // Handle undefined, null, or invalid values
  if (amount === undefined || amount === null || isNaN(amount)) {
    amount = 0;
  }
  
  // Ensure amount is a valid number
  const validAmount = typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0;
  
  if (currency === 'USDT') {
    return `${validAmount.toFixed(2)} USDT`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(validAmount);
}