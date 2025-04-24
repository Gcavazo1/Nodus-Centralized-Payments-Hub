import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and merges Tailwind CSS classes using clsx and tailwind-merge
 * 
 * @param inputs - Array of class values, conditionals, or objects
 * @returns Merged and optimized className string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as currency
 * 
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Formats a date as a readable string
 * 
 * @param date - Date to format (Date object or ISO string)
 * @param options - Intl.DateTimeFormatOptions (optional)
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { 
    month: "short", 
    day: "numeric", 
    year: "numeric" 
  }
): string {
  const dateObject = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", options).format(dateObject);
}

/**
 * Truncates a string to a specified length
 * 
 * @param str - String to truncate
 * @param length - Maximum length (default: 50)
 * @param ending - String to append if truncated (default: "...")
 * @returns Truncated string
 */
export function truncate(str: string, length = 50, ending = "..."): string {
  if (str.length > length) {
    return str.substring(0, length - ending.length) + ending;
  }
  return str;
}
