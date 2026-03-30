export function formatNumber(n: number | null | undefined): string {
  if (n == null || n === 0) return '۰';
  return n.toLocaleString('fa-AF');
}

export function formatCurrency(n: number | null | undefined): string {
  if (n == null || n === 0) return '۰ افغانی';
  return n.toLocaleString('fa-AF') + ' افغانی';
}

export function toEnglishNumber(s: string): string {
  return s.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
}
