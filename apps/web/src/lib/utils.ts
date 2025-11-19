import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffInDays = Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) return "Prazo encerrado";
  if (diffInDays === 0) return "Hoje";
  if (diffInDays === 1) return "Amanhã";
  if (diffInDays < 7) return `${diffInDays} dias`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas`;
  return `${Math.floor(diffInDays / 30)} meses`;
}
