import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converte string de confiança (ex: "85.0%") para número decimal (ex: 0.85)
 */
export function parseConfidence(conf: string | number): number {
  if (typeof conf === 'number') return conf > 1 ? conf / 100 : conf;
  if (!conf) return 0;
  const num = parseFloat(conf.toString().replace('%', '').replace(',', '.'));
  return isNaN(num) ? 0 : num / 100;
}

/**
 * Formata número decimal de confiança (ex: 0.85) para string com "%" (ex: "85.0%")
 */
export function formatConfidence(conf: number | string): string {
  const num = typeof conf === 'string' ? parseFloat(conf.replace('%', '').replace(',', '.')) : conf;
  if (isNaN(num)) return '0.0%';
  return `${(num * 100).toFixed(1)}%`;
}
